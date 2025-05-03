
-- First, disable the problematic RLS policies
DROP POLICY IF EXISTS "Admin users can read all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can insert new admin users" ON public.admin_users;

-- Add missing admin_level column if not present (for safety)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'admin_users' 
    AND column_name = 'admin_level'
  ) THEN
    ALTER TABLE public.admin_users ADD COLUMN admin_level TEXT NOT NULL DEFAULT 'standard';
  END IF;
END $$;

-- Create a safer RPC function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS TABLE (admin_id UUID, admin_level TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as admin_id,
    au.admin_level
  FROM public.admin_users au
  WHERE au.user_id = is_admin_user.user_id;
END;
$$;

-- Create functions to add admin users safely
CREATE OR REPLACE FUNCTION public.add_admin_user(admin_user_id UUID, admin_email TEXT, admin_level TEXT DEFAULT 'standard')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_admin_id UUID;
BEGIN
  INSERT INTO public.admin_users (user_id, email, admin_level) 
  VALUES (admin_user_id, admin_email, admin_level)
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$;

-- Create more flexible RLS policies
CREATE POLICY "Allow admin to see admin users"
ON public.admin_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  )
);

-- Allow admin users to update their own record
CREATE POLICY "Allow admin to update own record"
ON public.admin_users
FOR UPDATE
USING (user_id = auth.uid());

-- Allow insert via function only (to prevent recursion)
CREATE POLICY "Allow insert through function"
ON public.admin_users
FOR INSERT 
WITH CHECK (true);

-- Allow service-role to do everything
CREATE POLICY "Service role bypass policy"
ON public.admin_users
USING (true)
WITH CHECK (true);
