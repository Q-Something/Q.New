
-- 1. Create the table for storing motivational quotes (only one active at a time)
CREATE TABLE public.motivational_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add RLS for admin (admin flag is managed in localStorage for now, but RLS for later real auth)
ALTER TABLE public.motivational_quotes ENABLE ROW LEVEL SECURITY;

-- Only allow all users to read (unless you want to restrict, then can remove this)
CREATE POLICY "Allow all to view active motivational quotes"
  ON public.motivational_quotes
  FOR SELECT
  USING (is_active);

-- Admin: allow full access for now (in future, restrict by user id/admin role)
CREATE POLICY "Admin can manage quotes"
  ON public.motivational_quotes
  FOR ALL
  USING (true);

