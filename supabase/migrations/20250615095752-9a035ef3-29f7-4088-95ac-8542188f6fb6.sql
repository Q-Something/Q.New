
-- 1. Drop all potentially conflicting old policies on user_points and profiles
DROP POLICY IF EXISTS "User can read their points" ON public.user_points;
DROP POLICY IF EXISTS "Allow public read access to user points" ON public.user_points;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2. Ensure RLS is enabled on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create new, correct policies
-- Allow ANYONE (including non-logged-in users) to read all user points
CREATE POLICY "Allow public read access to user points" 
  ON public.user_points 
  FOR SELECT 
  TO public -- public role includes anon and authenticated
  USING (true);

-- Allow ANYONE to read all profiles
CREATE POLICY "Allow public read access to profiles" 
  ON public.profiles 
  FOR SELECT 
  TO public
  USING (true);

-- Allow LOGGED-IN users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);
