
-- Fix function: cast role_name to app_role to compare ENUM to text properly
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = has_role.user_id AND role = role_name::app_role
  );
$$;

-- Ensure RLS enabled for tbh_questions
ALTER TABLE public.tbh_questions ENABLE ROW LEVEL SECURITY;

-- Allow only admins to DELETE TBH questions
CREATE POLICY "Admins can delete TBH questions"
  ON public.tbh_questions
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow only admins to UPDATE TBH questions
CREATE POLICY "Admins can update TBH questions"
  ON public.tbh_questions
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
