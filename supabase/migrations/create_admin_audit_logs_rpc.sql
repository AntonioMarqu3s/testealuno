
-- Create a function that creates the admin_audit_logs table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_admin_audit_logs_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create enum type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_audit_action') THEN
    CREATE TYPE public.admin_audit_action AS ENUM (
      'user_created',
      'user_deleted',
      'user_updated',
      'plan_updated',
      'agent_created',
      'agent_updated',
      'agent_deleted',
      'payment_recorded',
      'login',
      'logout'
    );
  END IF;

  -- Create the table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_audit_logs') THEN
    CREATE TABLE public.admin_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      action admin_audit_action NOT NULL,
      performed_by UUID NOT NULL,
      target_id UUID,
      details JSONB
    );
    
    -- Grant access to the table
    GRANT ALL ON public.admin_audit_logs TO postgres;
    GRANT ALL ON public.admin_audit_logs TO anon;
    GRANT ALL ON public.admin_audit_logs TO authenticated;
    GRANT ALL ON public.admin_audit_logs TO service_role;
  END IF;
END;
$$;
