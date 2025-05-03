
-- Create a function to safely check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(checking_user_id UUID) 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = checking_user_id
  );
END;
$$;

-- Also create an alternative version of the function to support the edge function
-- that might be using different parameter naming
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS TABLE (
  is_admin BOOLEAN,
  admin_level TEXT,
  admin_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as is_admin,
    au.admin_level,
    au.id as admin_id
  FROM public.admin_users au
  WHERE au.user_id = is_admin_user.user_id;
END;
$$;

-- Make sure we have the admin level column
ALTER TABLE IF NOT EXISTS public.admin_users 
ADD COLUMN IF NOT EXISTS admin_level TEXT DEFAULT 'standard';
