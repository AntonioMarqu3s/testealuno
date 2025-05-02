
-- Add missing UPSERT policy for user_plans table
CREATE POLICY "Allow users to insert their own plan" 
  ON public.user_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
-- Add missing policy for upsert operations
CREATE POLICY "Allow users to update their own plan" 
  ON public.user_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);
