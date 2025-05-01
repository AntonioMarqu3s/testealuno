
-- Create public profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  instance_id TEXT NOT NULL,
  client_identifier TEXT
);

-- Create RLS policies for agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own agents" 
  ON public.agents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own agents" 
  ON public.agents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own agents" 
  ON public.agents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own agents" 
  ON public.agents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create user_plans table
CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  agent_limit INTEGER NOT NULL DEFAULT 1,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create RLS policies for user_plans
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own plan" 
  ON public.user_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own plan" 
  ON public.user_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  trial_end TIMESTAMP WITH TIME ZONE;
  selected_plan INTEGER;
  trial_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get trial start date from user metadata or use current timestamp
  trial_start := COALESCE(
    (NEW.raw_user_meta_data->>'trialStartDate')::TIMESTAMP WITH TIME ZONE, 
    NOW()
  );
  
  -- Calculate trial end date (5 days from trial start)
  trial_end := trial_start + INTERVAL '5 days';
  
  -- Get selected plan from user metadata if available
  selected_plan := (NEW.raw_user_meta_data->>'plan')::INTEGER;
  IF selected_plan IS NULL THEN
    selected_plan := 0; -- Default to FREE_TRIAL if not specified
  END IF;
  
  -- Create a profile for the new user
  INSERT INTO public.profiles (id, user_id, email)
  VALUES (NEW.id, NEW.id, NEW.email);
  
  -- Create a plan for the new user
  INSERT INTO public.user_plans (
    user_id, 
    plan, 
    name, 
    agent_limit, 
    trial_ends_at
  )
  VALUES (
    NEW.id, 
    selected_plan, 
    CASE 
      WHEN selected_plan = 0 THEN 'Teste Gratuito'
      WHEN selected_plan = 1 THEN 'Inicial' 
      WHEN selected_plan = 2 THEN 'Padrão'
      WHEN selected_plan = 3 THEN 'Premium'
      ELSE 'Teste Gratuito'
    END,
    CASE 
      WHEN selected_plan = 0 THEN 1
      WHEN selected_plan = 1 THEN 1
      WHEN selected_plan = 2 THEN 3
      WHEN selected_plan = 3 THEN 10
      ELSE 1
    END,
    CASE 
      WHEN selected_plan = 0 THEN trial_end
      ELSE NULL
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function after a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
