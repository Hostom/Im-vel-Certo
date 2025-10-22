-- =============================================
-- RAILWAY MIGRATION: Row Level Security (OPCIONAL)
-- =============================================
-- Este arquivo é OPCIONAL e adiciona RLS ao PostgreSQL
-- 
-- IMPORTANTE: 
-- - RLS sozinho NÃO funciona sem auth.uid() do Supabase
-- - Você precisa fazer "SET LOCAL app.current_user_id = 'uuid'" antes de cada query
-- - É mais complexo e requer adaptação no backend
-- - RECOMENDADO: Fazer controle de acesso no backend (mais simples)
-- 
-- Execute este arquivo APENAS se você entende como configurar
-- current_setting() com seu sistema de autenticação.
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_missoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_regionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FUNÇÃO AUXILIAR: Obter user_id da sessão
-- =============================================
-- Você precisa fazer "SET LOCAL app.current_user_id = 'uuid'" no backend
-- antes de cada query
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- FUNÇÃO: Verificar role do usuário atual
-- =============================================
CREATE OR REPLACE FUNCTION public.current_user_has_role(_role public.app_role)
RETURNS BOOLEAN AS $$
DECLARE
    current_id UUID;
BEGIN
    current_id := public.current_app_user_id();
    IF current_id IS NULL THEN
        RETURN false;
    END IF;
    
    RETURN public.user_has_role(current_id, _role);
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- POLÍTICAS RLS: usuarios
-- =============================================

-- SELECT: Usuários veem próprio perfil, gerentes veem subordinados, admins veem todos
CREATE POLICY "rls_usuarios_select"
    ON public.usuarios FOR SELECT
    USING (
        id = public.current_app_user_id() OR
        gerente_responsavel_id = public.current_app_user_id() OR
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

-- INSERT: Apenas admins podem criar usuários
CREATE POLICY "rls_usuarios_insert"
    ON public.usuarios FOR INSERT
    WITH CHECK (
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

-- UPDATE: Apenas admins podem atualizar usuários
CREATE POLICY "rls_usuarios_update"
    ON public.usuarios FOR UPDATE
    USING (
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

-- =============================================
-- POLÍTICAS RLS: user_roles
-- =============================================

CREATE POLICY "rls_user_roles_select"
    ON public.user_roles FOR SELECT
    USING (user_id = public.current_app_user_id());

CREATE POLICY "rls_user_roles_insert"
    ON public.user_roles FOR INSERT
    WITH CHECK (
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

CREATE POLICY "rls_user_roles_delete"
    ON public.user_roles FOR DELETE
    USING (
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

-- =============================================
-- POLÍTICAS RLS: demandas
-- =============================================

-- SELECT: Captadores veem demandas atribuídas, gerentes/admins veem todas
CREATE POLICY "rls_demandas_select"
    ON public.demandas FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.missoes m
            WHERE m.demanda_id = id AND m.captador_id = public.current_app_user_id()
        ) OR
        public.current_user_has_role('gerente_regional') OR
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

-- INSERT/UPDATE: Apenas gerentes e admins
CREATE POLICY "rls_demandas_insert"
    ON public.demandas FOR INSERT
    WITH CHECK (
        public.current_user_has_role('gerente_regional') OR
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

CREATE POLICY "rls_demandas_update"
    ON public.demandas FOR UPDATE
    USING (
        public.current_user_has_role('gerente_regional') OR
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

-- =============================================
-- POLÍTICAS RLS: missoes
-- =============================================

CREATE POLICY "rls_missoes_select"
    ON public.missoes FOR SELECT
    USING (
        captador_id = public.current_app_user_id() OR
        public.current_user_has_role('gerente_regional') OR
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

CREATE POLICY "rls_missoes_insert"
    ON public.missoes FOR INSERT
    WITH CHECK (
        public.current_user_has_role('gerente_regional') OR
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

CREATE POLICY "rls_missoes_update"
    ON public.missoes FOR UPDATE
    USING (
        captador_id = public.current_app_user_id() OR
        public.current_user_has_role('gerente_regional') OR
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

-- =============================================
-- POLÍTICAS RLS: historico_missoes
-- =============================================

CREATE POLICY "rls_historico_missoes_select"
    ON public.historico_missoes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.missoes m
            WHERE m.id = missao_id AND (
                m.captador_id = public.current_app_user_id() OR
                public.current_user_has_role('gerente_regional') OR
                public.current_user_has_role('admin') OR
                public.current_user_has_role('diretor')
            )
        )
    );

CREATE POLICY "rls_historico_missoes_insert"
    ON public.historico_missoes FOR INSERT
    WITH CHECK (true);

-- =============================================
-- POLÍTICAS RLS: relatorios
-- =============================================

CREATE POLICY "rls_relatorios_select"
    ON public.relatorios FOR SELECT
    USING (
        public.current_user_has_role('gerente_regional') OR
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

CREATE POLICY "rls_relatorios_insert"
    ON public.relatorios FOR INSERT
    WITH CHECK (
        public.current_user_has_role('gerente_regional') OR
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

-- =============================================
-- POLÍTICAS RLS: configuracoes_regionais
-- =============================================

CREATE POLICY "rls_configuracoes_select"
    ON public.configuracoes_regionais FOR SELECT
    USING (true);

CREATE POLICY "rls_configuracoes_all"
    ON public.configuracoes_regionais FOR ALL
    USING (
        public.current_user_has_role('admin') OR
        public.current_user_has_role('diretor')
    );

-- =============================================
-- POLÍTICAS RLS: sessions
-- =============================================

CREATE POLICY "rls_sessions_select"
    ON public.sessions FOR SELECT
    USING (user_id = public.current_app_user_id());

CREATE POLICY "rls_sessions_insert"
    ON public.sessions FOR INSERT
    WITH CHECK (user_id = public.current_app_user_id());

CREATE POLICY "rls_sessions_delete"
    ON public.sessions FOR DELETE
    USING (user_id = public.current_app_user_id());

-- =============================================
-- COMENTÁRIO IMPORTANTE
-- =============================================

COMMENT ON FUNCTION public.current_app_user_id IS 
'IMPORTANTE: Para usar RLS, você deve executar esta query antes de cada transação:
SET LOCAL app.current_user_id = ''uuid-do-usuario'';

Exemplo no backend (Node.js):
await client.query(SET LOCAL app.current_user_id = $1, [userId]);
await client.query(SELECT * FROM demandas);

Sem isso, RLS bloqueará todos os acessos!';

-- =============================================
-- FIM DAS POLÍTICAS RLS
-- =============================================


