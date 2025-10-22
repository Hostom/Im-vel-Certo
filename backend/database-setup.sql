-- Script SQL para configurar o banco de dados no Railway
-- Execute este script no PostgreSQL do Railway

-- Habilita UUIDs (Railway/Postgres)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função/trigger para manter updated_at sempre atualizado
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Tabela: usuarios
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('captador','gerente_regional','admin','diretor')),
  regiao TEXT NOT NULL DEFAULT 'Geral',
  regioes_responsavel TEXT NULL,
  gerente_responsavel_id UUID NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_usuarios_set_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_set_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios (tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_regiao ON usuarios (regiao);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios (ativo);

-- =========================
-- Tabela: user_roles (roles adicionais do usuário)
-- =========================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('captador','gerente_regional','admin','diretor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evita duplicidade de role por usuário
CREATE UNIQUE INDEX IF NOT EXISTS ux_user_roles_user_role ON user_roles (user_id, role);

-- =========================
-- Tabela: sessions (rastreamento / logout)
-- =========================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Busca/limpeza rápida por token_hash e usuário
CREATE UNIQUE INDEX IF NOT EXISTS ux_sessions_token_hash ON sessions (token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);

-- =========================
-- Tabela: demandas
-- =========================
CREATE TABLE IF NOT EXISTS demandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_demanda TEXT NOT NULL,
  consultor_locacao TEXT NOT NULL,
  cliente_interessado TEXT NOT NULL,
  contato TEXT NOT NULL,
  tipo_imovel TEXT NOT NULL,
  regiao_desejada TEXT NOT NULL,
  regiao_demanda TEXT NOT NULL DEFAULT 'Geral',
  faixa_aluguel TEXT NOT NULL,
  valor_aluguel_min NUMERIC(12,2),
  valor_aluguel_max NUMERIC(12,2),
  caracteristicas_desejadas TEXT,
  prazo_necessidade TEXT NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_captacao','concluida','cancelada')),
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_demandas_set_updated_at ON demandas;
CREATE TRIGGER trg_demandas_set_updated_at
BEFORE UPDATE ON demandas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Índices úteis para filtros comuns
CREATE INDEX IF NOT EXISTS idx_demandas_status ON demandas (status);
CREATE INDEX IF NOT EXISTS idx_demandas_regiao_demanda ON demandas (regiao_demanda);
CREATE INDEX IF NOT EXISTS idx_demandas_created_at ON demandas (created_at);
CREATE INDEX IF NOT EXISTS idx_demandas_criado_por_id ON demandas (criado_por_id);

-- =========================
-- Tabela: missoes (prevista nos tipos do backend)
-- =========================
CREATE TABLE IF NOT EXISTS missoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
  captador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_por_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (
    status IN (
      'pendente','em_andamento','imovel_encontrado','apresentado_cliente',
      'locacao_fechada','cancelada','tempo_esgotado'
    )
  ),
  data_atribuicao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prazo_horas INT NOT NULL,
  data_limite TIMESTAMPTZ,
  tempo_decorrido_minutos INT NOT NULL DEFAULT 0,
  observacoes_captador TEXT,
  imovel_encontrado_detalhes TEXT,
  data_conclusao TIMESTAMPTZ,
  resultado TEXT CHECK (resultado IN ('sucesso','fracasso','tempo_esgotado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_missoes_set_updated_at ON missoes;
CREATE TRIGGER trg_missoes_set_updated_at
BEFORE UPDATE ON missoes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_missoes_status ON missoes (status);
CREATE INDEX IF NOT EXISTS idx_missoes_demanda_id ON missoes (demanda_id);
CREATE INDEX IF NOT EXISTS idx_missoes_captador_id ON missoes (captador_id);
CREATE INDEX IF NOT EXISTS idx_missoes_created_at ON missoes (created_at);

-- =========================
-- Usuário admin padrão (opcional)
-- =========================
-- Senha: admin123 (hash: $2b$10$...)
INSERT INTO usuarios (nome, email, senha_hash, tipo, regiao) 
VALUES (
  'Administrador', 
  'admin@imovelcerto.com', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'admin', 
  'Geral'
) ON CONFLICT (email) DO NOTHING;

-- Adicionar role admin
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' FROM usuarios WHERE email = 'admin@imovelcerto.com'
ON CONFLICT (user_id, role) DO NOTHING;
