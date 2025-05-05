-- Add agent_data column to agents table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'agents' 
    AND column_name = 'agent_data'
  ) THEN
    ALTER TABLE public.agents ADD COLUMN agent_data JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Ensure we have RLS policies for the agents table
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
  -- Users can select their own agents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'agents' 
    AND policyname = 'Allow users to read their own agents'
  ) THEN
    CREATE POLICY "Allow users to read their own agents" 
    ON public.agents FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;

  -- Users can insert their own agents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'agents' 
    AND policyname = 'Allow users to insert their own agents'
  ) THEN
    CREATE POLICY "Allow users to insert their own agents" 
    ON public.agents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update their own agents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'agents' 
    AND policyname = 'Allow users to update their own agents'
  ) THEN
    CREATE POLICY "Allow users to update their own agents" 
    ON public.agents FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;

  -- Users can delete their own agents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'agents' 
    AND policyname = 'Allow users to delete their own agents'
  ) THEN
    CREATE POLICY "Allow users to delete their own agents" 
    ON public.agents FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;
