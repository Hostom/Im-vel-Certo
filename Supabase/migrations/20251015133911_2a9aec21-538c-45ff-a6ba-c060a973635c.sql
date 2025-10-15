-- =============================================
-- SECURITY FIX: Implement Proper Role-Based Access Control
-- =============================================

-- 1. Create app_role enum for type safety
CREATE TYPE public.app_role AS ENUM ('captador', 'gerente_regional', 'admin', 'diretor');

-- 2. Create user_roles table (separate from usuarios to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Only admins can assign roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'diretor')
    )
  );

CREATE POLICY "Only admins can remove roles"
  ON public.user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'diretor')
    )
  );

-- 3. Create SECURITY DEFINER function to check roles (breaks RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 4. Migrate existing roles from usuarios table to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, tipo::public.app_role
FROM public.usuarios
WHERE tipo IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- =============================================
-- FIX USUARIOS TABLE RLS POLICIES
-- =============================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Usuários autenticados podem ver todos os usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Apenas admins podem atualizar usuários" ON public.usuarios;
DROP POLICY IF EXISTS "Apenas admins podem inserir usuários" ON public.usuarios;

-- New restrictive SELECT policy: users see only their own record, managers see their reports, admins see all
CREATE POLICY "Users can view own profile, managers see reports, admins see all"
  ON public.usuarios FOR SELECT
  USING (
    auth.uid() = id OR
    gerente_responsavel_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- Only admins can update usuarios
CREATE POLICY "Only admins can update usuarios"
  ON public.usuarios FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- Only admins can insert usuarios
CREATE POLICY "Only admins can insert usuarios"
  ON public.usuarios FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- =============================================
-- FIX DEMANDAS TABLE RLS POLICIES
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Usuários autenticados podem ver demandas" ON public.demandas;
DROP POLICY IF EXISTS "Gerentes e admins podem criar demandas" ON public.demandas;
DROP POLICY IF EXISTS "Gerentes e admins podem atualizar demandas" ON public.demandas;

-- Captadores see only demands assigned to them via missions
CREATE POLICY "Captadores see assigned demands, managers and admins see all"
  ON public.demandas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.missoes m
      WHERE m.demanda_id = id AND m.captador_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'gerente_regional') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- Only managers and admins can create demands
CREATE POLICY "Only managers and admins can create demands"
  ON public.demandas FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'gerente_regional') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- Only managers and admins can update demands
CREATE POLICY "Only managers and admins can update demands"
  ON public.demandas FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'gerente_regional') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- =============================================
-- FIX MISSOES TABLE RLS POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Usuários podem ver suas próprias missões ou todas se forem g" ON public.missoes;
DROP POLICY IF EXISTS "Gerentes podem criar missões" ON public.missoes;
DROP POLICY IF EXISTS "Captadores podem atualizar suas próprias missões" ON public.missoes;

-- Captadores see own missions, managers and admins see all
CREATE POLICY "Captadores see own missions, managers and admins see all"
  ON public.missoes FOR SELECT
  USING (
    captador_id = auth.uid() OR
    public.has_role(auth.uid(), 'gerente_regional') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- Only managers and admins can create missions
CREATE POLICY "Only managers and admins can create missions"
  ON public.missoes FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'gerente_regional') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- Captadores can update own missions, managers and admins can update all
CREATE POLICY "Captadores update own missions, managers update all"
  ON public.missoes FOR UPDATE
  USING (
    captador_id = auth.uid() OR
    public.has_role(auth.uid(), 'gerente_regional') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- =============================================
-- FIX HISTORICO_MISSOES TABLE RLS POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Usuários podem ver histórico das missões que podem ver" ON public.historico_missoes;
DROP POLICY IF EXISTS "Sistema pode inserir histórico" ON public.historico_missoes;

-- Users can see history of missions they can see
CREATE POLICY "Users see history of missions they can access"
  ON public.historico_missoes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.missoes m
      WHERE m.id = historico_missoes.missao_id 
      AND (
        m.captador_id = auth.uid() OR
        public.has_role(auth.uid(), 'gerente_regional') OR
        public.has_role(auth.uid(), 'admin') OR
        public.has_role(auth.uid(), 'diretor')
      )
    )
  );

-- System can insert history
CREATE POLICY "System can insert history"
  ON public.historico_missoes FOR INSERT
  WITH CHECK (true);

-- =============================================
-- FIX RELATORIOS TABLE RLS POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Usuários podem ver relatórios" ON public.relatorios;
DROP POLICY IF EXISTS "Gerentes podem criar relatórios" ON public.relatorios;

-- Only managers and admins can view reports
CREATE POLICY "Only managers and admins can view reports"
  ON public.relatorios FOR SELECT
  USING (
    public.has_role(auth.uid(), 'gerente_regional') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- Only managers and admins can create reports
CREATE POLICY "Only managers and admins can create reports"
  ON public.relatorios FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'gerente_regional') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- =============================================
-- FIX CONFIGURACOES_REGIONAIS TABLE RLS POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Todos podem ver configurações regionais" ON public.configuracoes_regionais;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar configurações" ON public.configuracoes_regionais;

-- Everyone can view regional configs
CREATE POLICY "Everyone can view regional configs"
  ON public.configuracoes_regionais FOR SELECT
  USING (true);

-- Only admins can manage configs
CREATE POLICY "Only admins can manage configs"
  ON public.configuracoes_regionais FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- =============================================
-- FIX SECURITY DEFINER VIEW
-- =============================================

-- Drop and recreate view without SECURITY DEFINER
DROP VIEW IF EXISTS public.vw_metricas_dashboard;

CREATE VIEW public.vw_metricas_dashboard AS
SELECT 
  COUNT(d.id) as total_demandas,
  COUNT(d.id) FILTER (WHERE d.status = 'pendente') as demandas_pendentes,
  COUNT(d.id) FILTER (WHERE d.status = 'em_captacao') as demandas_em_captacao,
  COUNT(d.id) FILTER (WHERE d.status = 'concluida') as demandas_concluidas,
  COUNT(m.id) as total_missoes,
  COUNT(m.id) FILTER (WHERE m.status IN ('pendente', 'em_progresso')) as missoes_ativas,
  COUNT(m.id) FILTER (WHERE m.status = 'concluida' AND m.resultado = 'sucesso') as missoes_sucesso,
  COUNT(m.id) FILTER (WHERE m.status = 'tempo_esgotado') as missoes_tempo_esgotado,
  AVG(EXTRACT(EPOCH FROM (m.data_conclusao - m.data_atribuicao)) / 3600) FILTER (WHERE m.data_conclusao IS NOT NULL) as tempo_medio_conclusao_horas
FROM public.demandas d
LEFT JOIN public.missoes m ON d.id = m.demanda_id;

-- Add RLS to the view (only managers and admins can see dashboard metrics)
ALTER VIEW public.vw_metricas_dashboard SET (security_invoker = true);

-- =============================================
-- ADD COMMENT
-- =============================================

COMMENT ON TABLE public.user_roles IS 'Separate roles table to prevent privilege escalation attacks. Roles should NEVER be stored on the usuarios table.';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check user roles without triggering RLS recursion.';