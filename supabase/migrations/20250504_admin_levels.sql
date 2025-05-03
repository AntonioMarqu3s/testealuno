
-- Add admin_level column to admin_users table if it doesn't exist
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
  
  -- Update initial admin to be a master admin
  UPDATE public.admin_users
  SET admin_level = 'master'
  WHERE email = 'admin@example.com' OR user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
  );
END $$;

-- Create RPC function to check if user is admin user
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
