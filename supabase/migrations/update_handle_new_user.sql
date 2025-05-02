
-- Update the user creation trigger to ensure user_plans are properly created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  trial_end TIMESTAMP WITH TIME ZONE;
  selected_plan INTEGER;
  has_promo BOOLEAN;
  trial_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get trial start date or use current timestamp
  trial_start := NOW();
  
  -- Get selected plan from user metadata if available
  selected_plan := (NEW.raw_user_meta_data->>'plan')::INTEGER;
  IF selected_plan IS NULL THEN
    selected_plan := 0; -- Default to FREE_TRIAL if not specified
  END IF;

  -- Check if user has promo code
  has_promo := (NEW.raw_user_meta_data->>'hasPromoCode')::BOOLEAN;
  IF has_promo IS NULL THEN
    has_promo := false;
  END IF;
  
  -- Calculate trial end date (5 days from trial start) if it's FREE_TRIAL or has promo
  IF selected_plan = 0 OR has_promo THEN
    trial_end := trial_start + INTERVAL '5 days';
  ELSE
    trial_end := NULL;
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
    trial_ends_at,
    updated_at
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
    trial_end,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
