-- =============================================
-- RAILWAY MIGRATION: Initial Schema
-- Sistema de Gestão de Captação
-- Data: Outubro 2025
-- =============================================
-- Este arquivo adapta o schema do Supabase para PostgreSQL puro
-- IMPORTANTE: Sem auth.uid() - controle de acesso será feito no backend
-- =============================================

-- 1. Criar tipos ENUM
CREATE TYPE public.app_role AS ENUM ('captador', 'gerente_regional', 'admin', 'diretor');

CREATE TYPE public.status_demanda AS ENUM ('pendente', 'em_captacao', 'concluida', 'cancelada');

CREATE TYPE public.status_missao AS ENUM (
  'pendente', 
  'em_andamento', 
  'imovel_encontrado', 
  'apresentado_cliente', 
  'locacao_fechada', 
  'cancelada', 
  'tempo_esgotado'
);

CREATE TYPE public.resultado_missao AS ENUM ('sucesso', 'fracasso', 'tempo_esgotado');

-- =============================================
-- 2. TABELA: usuarios
-- =============================================
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL, -- Senha criptografada (bcrypt)
    tipo public.app_role NOT NULL DEFAULT 'captador',
    regiao TEXT DEFAULT 'Geral',
    regioes_responsavel TEXT, -- JSON array de regiões (para gerentes)
    gerente_responsavel_id UUID REFERENCES public.usuarios(id),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_usuarios_tipo ON public.usuarios(tipo);
CREATE INDEX idx_usuarios_regiao ON public.usuarios(regiao);
CREATE INDEX idx_usuarios_ativo ON public.usuarios(ativo);

-- =============================================
-- 3. TABELA: user_roles (roles adicionais)
-- =============================================
-- Um usuário pode ter múltiplas roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.usuarios(id),
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- =============================================
-- 4. TABELA: demandas
-- =============================================
CREATE TABLE public.demandas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_demanda TEXT UNIQUE NOT NULL,
    consultor_locacao TEXT NOT NULL,
    cliente_interessado TEXT NOT NULL,
    contato TEXT NOT NULL,
    tipo_imovel TEXT NOT NULL,
    regiao_desejada TEXT NOT NULL,
    regiao_demanda TEXT DEFAULT 'Geral',
    faixa_aluguel TEXT NOT NULL,
    valor_aluguel_min DECIMAL(10,2),
    valor_aluguel_max DECIMAL(10,2),
    caracteristicas_desejadas TEXT,
    prazo_necessidade TEXT NOT NULL,
    observacoes TEXT,
    criado_por_id UUID REFERENCES public.usuarios(id),
    status public.status_demanda DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_demandas_status ON public.demandas(status);
CREATE INDEX idx_demandas_regiao ON public.demandas(regiao_demanda);
CREATE INDEX idx_demandas_valor ON public.demandas(valor_aluguel_min, valor_aluguel_max);
CREATE INDEX idx_demandas_criado_por ON public.demandas(criado_por_id);
CREATE INDEX idx_demandas_codigo ON public.demandas(codigo_demanda);

-- =============================================
-- 5. TABELA: missoes
-- =============================================
CREATE TABLE public.missoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id UUID REFERENCES public.demandas(id) ON DELETE CASCADE,
    captador_id UUID REFERENCES public.usuarios(id),
    criado_por_id UUID REFERENCES public.usuarios(id),
    status public.status_missao DEFAULT 'pendente',
    data_atribuicao TIMESTAMPTZ DEFAULT NOW(),
    prazo_horas INTEGER DEFAULT 48,
    data_limite TIMESTAMPTZ,
    tempo_decorrido_minutos INTEGER DEFAULT 0,
    observacoes_captador TEXT,
    imovel_encontrado_detalhes TEXT,
    data_conclusao TIMESTAMPTZ,
    resultado public.resultado_missao,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_missoes_captador ON public.missoes(captador_id);
CREATE INDEX idx_missoes_demanda ON public.missoes(demanda_id);
CREATE INDEX idx_missoes_status ON public.missoes(status);
CREATE INDEX idx_missoes_data_limite ON public.missoes(data_limite);

-- =============================================
-- 6. TABELA: historico_missoes
-- =============================================
CREATE TABLE public.historico_missoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID REFERENCES public.missoes(id) ON DELETE CASCADE,
    status_anterior TEXT,
    status_novo TEXT,
    tempo_na_etapa_minutos INTEGER,
    observacoes TEXT,
    alterado_por_id UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_historico_missao ON public.historico_missoes(missao_id);

-- =============================================
-- 7. TABELA: relatorios
-- =============================================
CREATE TABLE public.relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('demandas', 'missoes', 'performance', 'geral')),
    filtros JSONB,
    gerado_por_id UUID REFERENCES public.usuarios(id),
    regiao TEXT,
    data_inicio DATE,
    data_fim DATE,
    dados JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_relatorios_tipo ON public.relatorios(tipo);
CREATE INDEX idx_relatorios_gerado_por ON public.relatorios(gerado_por_id);

-- =============================================
-- 8. TABELA: configuracoes_regionais
-- =============================================
CREATE TABLE public.configuracoes_regionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regiao TEXT NOT NULL UNIQUE,
    gerente_responsavel_id UUID REFERENCES public.usuarios(id),
    ativo BOOLEAN DEFAULT TRUE,
    meta_captacoes_mes INTEGER DEFAULT 10,
    prazo_padrao_horas INTEGER DEFAULT 48,
    configuracoes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_config_regionais_regiao ON public.configuracoes_regionais(regiao);

-- =============================================
-- 9. TABELA: sessions (para autenticação)
-- =============================================
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, -- Hash do JWT ou session token
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON public.sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON public.sessions(expires_at);

-- =============================================
-- 10. TRIGGERS: Atualizar updated_at automaticamente
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demandas_updated_at 
    BEFORE UPDATE ON public.demandas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missoes_updated_at 
    BEFORE UPDATE ON public.missoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_regionais_updated_at 
    BEFORE UPDATE ON public.configuracoes_regionais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 11. TRIGGER: Calcular data limite da missão
-- =============================================
CREATE OR REPLACE FUNCTION calcular_data_limite()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.prazo_horas IS NOT NULL AND NEW.data_atribuicao IS NOT NULL THEN
        NEW.data_limite = NEW.data_atribuicao + (NEW.prazo_horas || ' hours')::INTERVAL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calcular_data_limite_trigger 
    BEFORE INSERT OR UPDATE ON public.missoes
    FOR EACH ROW EXECUTE FUNCTION calcular_data_limite();

-- =============================================
-- 12. VIEW: Dashboard de métricas
-- =============================================
CREATE OR REPLACE VIEW public.vw_metricas_dashboard AS
SELECT 
    COUNT(d.id) as total_demandas,
    COUNT(d.id) FILTER (WHERE d.status = 'pendente') as demandas_pendentes,
    COUNT(d.id) FILTER (WHERE d.status = 'em_captacao') as demandas_em_captacao,
    COUNT(d.id) FILTER (WHERE d.status = 'concluida') as demandas_concluidas,
    COUNT(m.id) as total_missoes,
    COUNT(m.id) FILTER (WHERE m.status IN ('pendente', 'em_andamento')) as missoes_ativas,
    COUNT(m.id) FILTER (WHERE m.status = 'locacao_fechada') as missoes_sucesso,
    COUNT(m.id) FILTER (WHERE m.status = 'tempo_esgotado') as missoes_tempo_esgotado,
    AVG(EXTRACT(EPOCH FROM (m.data_conclusao - m.data_atribuicao)) / 3600) 
        FILTER (WHERE m.data_conclusao IS NOT NULL) as tempo_medio_conclusao_horas
FROM public.demandas d
LEFT JOIN public.missoes m ON d.id = m.demanda_id;

-- =============================================
-- 13. FUNÇÃO: Verificar se usuário tem role
-- =============================================
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = _user_id AND tipo = _role
    ) OR EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- 14. FUNÇÃO: Limpar sessões expiradas
-- =============================================
CREATE OR REPLACE FUNCTION public.clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.sessions
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMENTÁRIOS
-- =============================================
COMMENT ON TABLE public.usuarios IS 'Tabela de usuários do sistema com autenticação própria';
COMMENT ON TABLE public.user_roles IS 'Roles adicionais dos usuários (um usuário pode ter múltiplas roles)';
COMMENT ON TABLE public.sessions IS 'Sessões ativas de usuários autenticados';
COMMENT ON COLUMN public.usuarios.senha_hash IS 'Senha criptografada com bcrypt';
COMMENT ON FUNCTION public.clean_expired_sessions IS 'Função para limpar sessões expiradas - executar periodicamente';

-- =============================================
-- FIM DO SCHEMA INICIAL
-- =============================================

