
-- Create a function to count total users
CREATE OR REPLACE FUNCTION public.admin_count_total_users()
RETURNS TABLE(count bigint) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT COUNT(*)::bigint FROM auth.users;
END;
$$;

-- Create a function to count new users in the last 30 days
CREATE OR REPLACE FUNCTION public.admin_count_new_users()
RETURNS TABLE(count bigint) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT COUNT(*)::bigint 
  FROM auth.users 
  WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days');
END;
$$;

-- Create a function to count agents
CREATE OR REPLACE FUNCTION public.admin_count_agents()
RETURNS TABLE(count bigint) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT COUNT(*)::bigint FROM public.agents;
END;
$$;

-- Create a function to count active subscriptions
CREATE OR REPLACE FUNCTION public.admin_count_active_subscriptions()
RETURNS TABLE(count bigint) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT COUNT(*)::bigint 
  FROM public.user_plans 
  WHERE plan > 0 AND payment_status = 'completed';
END;
$$;
