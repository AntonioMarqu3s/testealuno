
import { supabase } from '@/lib/supabase';
import { PlanType } from './userPlanService';

// Update user plan connection status in Supabase
export const updatePlanConnectionStatus = async (
  userId: string,
  connectInstancia: boolean
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_plans')
    .update({
      connect_instancia: connectInstancia,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating plan connection status:', error);
    return false;
  }

  return true;
};

// Get user plan connection status from Supabase
export const getPlanConnectionStatus = async (
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_plans')
    .select('connect_instancia')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error getting plan connection status:', error);
    return false;
  }

  return data.connect_instancia || false;
};
