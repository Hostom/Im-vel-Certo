-- =============================================
-- FIX: Ensure all existing users have roles in user_roles table
-- =============================================

-- This migration ensures that all usuarios have corresponding entries in user_roles
-- based on their tipo field

-- First, let's make sure user_roles table exists and sync from usuarios
INSERT INTO public.user_roles (user_id, role)
SELECT id, tipo::public.app_role
FROM public.usuarios
WHERE tipo IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Also, let's add a policy to allow users to assign themselves 'captador' role during signup
-- This was missing and causes issues for new signups
DROP POLICY IF EXISTS "Users can assign captador role to self, admins assign any" ON public.user_roles;

CREATE POLICY "Users can assign captador role to self, admins assign any"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    -- Allow users to assign themselves the 'captador' role during signup
    (user_id = auth.uid() AND role = 'captador') OR
    -- Allow admins to assign any role
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- Verify: Show all users and their roles
SELECT 
  u.nome,
  u.email,
  u.tipo as tipo_usuarios,
  array_agg(ur.role) as roles_atribuidas
FROM public.usuarios u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
GROUP BY u.id, u.nome, u.email, u.tipo;


