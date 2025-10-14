-- Script de criação do banco de dados para Sistema de Gestão de Captação
-- Autor: Sistema Manus
-- Data: Outubro 2025

-- 1. Criar tabela de usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'diretor', 'gerente_regional', 'captador')),
    regiao TEXT DEFAULT 'Geral',
    regioes_responsavel TEXT, -- Para gerentes que cuidam de múltiplas regiões (JSON array)
    gerente_responsavel_id UUID REFERENCES usuarios(id),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela de demandas
CREATE TABLE demandas (
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
    criado_por_id UUID REFERENCES usuarios(id),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_captacao', 'concluida', 'cancelada')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela de missões (captação)
CREATE TABLE missoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demanda_id UUID REFERENCES demandas(id) ON DELETE CASCADE,
    captador_id UUID REFERENCES usuarios(id),
    criado_por_id UUID REFERENCES usuarios(id),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'imovel_encontrado', 'apresentado_cliente', 'locacao_fechada', 'cancelada', 'tempo_esgotado')),
    data_atribuicao TIMESTAMPTZ DEFAULT NOW(),
    prazo_horas INTEGER DEFAULT 48,
    data_limite TIMESTAMPTZ,
    tempo_decorrido_minutos INTEGER DEFAULT 0,
    observacoes_captador TEXT,
    imovel_encontrado_detalhes TEXT,
    data_conclusao TIMESTAMPTZ,
    resultado TEXT, -- 'sucesso', 'fracasso', 'tempo_esgotado'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar tabela de histórico de etapas das missões
CREATE TABLE historico_missoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    missao_id UUID REFERENCES missoes(id) ON DELETE CASCADE,
    status_anterior TEXT,
    status_novo TEXT,
    tempo_na_etapa_minutos INTEGER,
    observacoes TEXT,
    alterado_por_id UUID REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Criar tabela de relatórios
CREATE TABLE relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('demandas', 'missoes', 'performance', 'geral')),
    filtros JSONB, -- JSON com filtros aplicados
    gerado_por_id UUID REFERENCES usuarios(id),
    regiao TEXT,
    data_inicio DATE,
    data_fim DATE,
    dados JSONB, -- JSON com dados do relatório
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Criar tabela de configurações regionais
CREATE TABLE configuracoes_regionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regiao TEXT NOT NULL UNIQUE,
    gerente_responsavel_id UUID REFERENCES usuarios(id),
    ativo BOOLEAN DEFAULT TRUE,
    meta_captacoes_mes INTEGER DEFAULT 10,
    prazo_padrao_horas INTEGER DEFAULT 48,
    configuracoes JSONB, -- Configurações específicas da região
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demandas_updated_at BEFORE UPDATE ON demandas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missoes_updated_at BEFORE UPDATE ON missoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_regionais_updated_at BEFORE UPDATE ON configuracoes_regionais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Criar função para calcular data limite da missão
CREATE OR REPLACE FUNCTION calcular_data_limite()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.prazo_horas IS NOT NULL AND NEW.data_atribuicao IS NOT NULL THEN
        NEW.data_limite = NEW.data_atribuicao + (NEW.prazo_horas || ' hours')::INTERVAL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calcular_data_limite_trigger BEFORE INSERT OR UPDATE ON missoes
    FOR EACH ROW EXECUTE FUNCTION calcular_data_limite();

-- 10. Habilitar Row Level Security em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_missoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_regionais ENABLE ROW LEVEL SECURITY;

-- 11. Criar políticas RLS para usuarios
CREATE POLICY "Usuários autenticados podem ver todos os usuários"
    ON usuarios FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Apenas admins podem inserir usuários"
    ON usuarios FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid() AND tipo IN ('admin', 'diretor')
        )
    );

CREATE POLICY "Apenas admins podem atualizar usuários"
    ON usuarios FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid() AND tipo IN ('admin', 'diretor')
        )
    );

-- 12. Criar políticas RLS para demandas
CREATE POLICY "Usuários autenticados podem ver demandas"
    ON demandas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Gerentes e admins podem criar demandas"
    ON demandas FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid() AND tipo IN ('admin', 'diretor', 'gerente_regional')
        )
    );

CREATE POLICY "Gerentes e admins podem atualizar demandas"
    ON demandas FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid() AND tipo IN ('admin', 'diretor', 'gerente_regional')
        )
    );

-- 13. Criar políticas RLS para missoes
CREATE POLICY "Usuários podem ver suas próprias missões ou todas se forem gerentes"
    ON missoes FOR SELECT
    TO authenticated
    USING (
        captador_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid() AND tipo IN ('admin', 'diretor', 'gerente_regional')
        )
    );

CREATE POLICY "Gerentes podem criar missões"
    ON missoes FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid() AND tipo IN ('admin', 'diretor', 'gerente_regional')
        )
    );

CREATE POLICY "Captadores podem atualizar suas próprias missões"
    ON missoes FOR UPDATE
    TO authenticated
    USING (
        captador_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid() AND tipo IN ('admin', 'diretor', 'gerente_regional')
        )
    );

-- 14. Criar políticas RLS para historico_missoes
CREATE POLICY "Usuários podem ver histórico das missões que podem ver"
    ON historico_missoes FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM missoes m
            WHERE m.id = missao_id AND (
                m.captador_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM usuarios
                    WHERE id = auth.uid() AND tipo IN ('admin', 'diretor', 'gerente_regional')
                )
            )
        )
    );

CREATE POLICY "Sistema pode inserir histórico"
    ON historico_missoes FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 15. Criar políticas RLS para relatorios
CREATE POLICY "Usuários podem ver relatórios"
    ON relatorios FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Gerentes podem criar relatórios"
    ON relatorios FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid() AND tipo IN ('admin', 'diretor', 'gerente_regional')
        )
    );

-- 16. Criar políticas RLS para configuracoes_regionais
CREATE POLICY "Todos podem ver configurações regionais"
    ON configuracoes_regionais FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Apenas admins podem gerenciar configurações"
    ON configuracoes_regionais FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE id = auth.uid() AND tipo IN ('admin', 'diretor')
        )
    );

-- 17. Criar índices para melhorar performance
CREATE INDEX idx_demandas_status ON demandas(status);
CREATE INDEX idx_demandas_regiao ON demandas(regiao_demanda);
CREATE INDEX idx_demandas_valor ON demandas(valor_aluguel_min, valor_aluguel_max);
CREATE INDEX idx_missoes_captador ON missoes(captador_id);
CREATE INDEX idx_missoes_demanda ON missoes(demanda_id);
CREATE INDEX idx_missoes_status ON missoes(status);
CREATE INDEX idx_missoes_data_limite ON missoes(data_limite);
CREATE INDEX idx_historico_missao ON historico_missoes(missao_id);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_regiao ON usuarios(regiao);

-- 18. Inserir regiões padrão
INSERT INTO configuracoes_regionais (regiao, meta_captacoes_mes, prazo_padrao_horas)
VALUES 
    ('Geral', 10, 48),
    ('Balneário Camboriú', 15, 48),
    ('Itajaí', 12, 48),
    ('Florianópolis', 20, 48);

-- 19. Criar view para dashboard de métricas
CREATE OR REPLACE VIEW vw_metricas_dashboard AS
SELECT 
    COUNT(DISTINCT d.id) as total_demandas,
    COUNT(DISTINCT CASE WHEN d.status = 'pendente' THEN d.id END) as demandas_pendentes,
    COUNT(DISTINCT CASE WHEN d.status = 'em_captacao' THEN d.id END) as demandas_em_captacao,
    COUNT(DISTINCT CASE WHEN d.status = 'concluida' THEN d.id END) as demandas_concluidas,
    COUNT(DISTINCT m.id) as total_missoes,
    COUNT(DISTINCT CASE WHEN m.status = 'em_andamento' THEN m.id END) as missoes_ativas,
    COUNT(DISTINCT CASE WHEN m.status = 'locacao_fechada' THEN m.id END) as missoes_sucesso,
    COUNT(DISTINCT CASE WHEN m.status = 'tempo_esgotado' THEN m.id END) as missoes_tempo_esgotado,
    AVG(CASE WHEN m.data_conclusao IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (m.data_conclusao - m.data_atribuicao))/3600 
    END) as tempo_medio_conclusao_horas
FROM demandas d
LEFT JOIN missoes m ON d.id = m.demanda_id;

-- 20. Habilitar realtime para tabelas críticas
ALTER PUBLICATION supabase_realtime ADD TABLE demandas;
ALTER PUBLICATION supabase_realtime ADD TABLE missoes;
ALTER PUBLICATION supabase_realtime ADD TABLE historico_missoes;