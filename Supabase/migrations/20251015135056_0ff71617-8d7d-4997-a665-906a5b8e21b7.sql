-- =============================================
-- FIX SIGNUP ISSUE: Allow self-registration
-- =============================================

-- Drop the overly restrictive INSERT policy on usuarios
DROP POLICY IF EXISTS "Only admins can insert usuarios" ON public.usuarios;

-- Create new policy that allows self-registration AND admin management
CREATE POLICY "Users can insert own profile, admins can insert any"
  ON public.usuarios FOR INSERT
  WITH CHECK (
    -- Allow users to create their own profile during signup
    auth.uid() = id OR
    -- OR admins can create profiles for others
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );

-- Also need to fix user_roles INSERT policy to allow self-assignment of 'captador' role
DROP POLICY IF EXISTS "Only admins can assign roles" ON public.user_roles;

-- New policy: users can assign themselves 'captador' role, admins can assign any role
CREATE POLICY "Users can assign captador role to self, admins assign any"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    -- Allow users to assign themselves the 'captador' role during signup
    (user_id = auth.uid() AND role = 'captador') OR
    -- OR admins can assign any role to anyone
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'diretor')
  );