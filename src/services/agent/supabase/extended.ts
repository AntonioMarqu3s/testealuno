
import { supabase } from '@/lib/supabase';
import { Agent, AgentExtended } from '@/components/agent/AgentTypes';
import { toast } from 'sonner';
import { getCurrentUser } from '@/services/auth/supabaseAuth';

/**
 * Fetch extended agent data from Supabase
 */
export const fetchExtendedAgentData = async (agentId: string): Promise<AgentExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('agents_extended')
      .select('*')
      .eq('id', agentId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching extended agent data:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching extended agent data:', error);
    return null;
  }
};

/**
 * Save or update extended agent data in Supabase
 */
export const saveExtendedAgentData = async (
  agent: Agent,
  extendedData: Partial<AgentExtended>
): Promise<boolean> => {
  try {
    // Make sure we have a valid UUID for user_id, not an email
    let userId = agent.userId || '';
    
    // If it's an email, we need to get the actual UUID
    if (userId.includes('@')) {
      // Try to get the user ID from Supabase auth
      const user = await getCurrentUser();
      if (user) {
        userId = user.id; // Use the authenticated user's ID
      } else {
        console.error('Cannot save extended data: No authenticated user found');
        return false;
      }
    }

    // Create extended data object with required fields
    const extendedAgentData = {
      id: agent.id,
      user_id: userId,
      name: agent.name,
      is_connected: agent.isConnected,
      instance_name: agent.instanceId,
      email: extendedData.email,
      plan_id: extendedData.planId,
      start_date: extendedData.startDate?.toISOString(),
      plan_end_date: extendedData.planEndDate?.toISOString(),
      trial_end_date: extendedData.trialEndDate?.toISOString(),
      payment_date: extendedData.paymentDate?.toISOString(),
      discount_coupon: extendedData.discountCoupon
    };

    console.log('Saving extended agent data:', extendedAgentData);

    // Use upsert to create or update the extended data
    const { error } = await supabase
      .from('agents_extended')
      .upsert(extendedAgentData);
      
    if (error) {
      console.error('Error saving extended agent data:', error);
      return false;
    }
    
    toast.success('Dados do agente salvos com sucesso');
    return true;
  } catch (error) {
    console.error('Exception saving extended agent data:', error);
    return false;
  }
};

/**
 * Update plan details for an agent
 */
export const updateAgentPlanDetails = async (
  agentId: string, 
  planId: number,
  planEndDate?: Date,
  discountCoupon?: string,
  paymentDate?: Date
): Promise<boolean> => {
  try {
    const updateData: any = { plan_id: planId };
    
    if (planEndDate) updateData.plan_end_date = planEndDate.toISOString();
    if (discountCoupon) updateData.discount_coupon = discountCoupon;
    if (paymentDate) updateData.payment_date = paymentDate.toISOString();
    
    const { error } = await supabase
      .from('agents_extended')
      .update(updateData)
      .eq('id', agentId);
      
    if (error) {
      console.error('Error updating agent plan details:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating agent plan details:', error);
    return false;
  }
};

/**
 * Update trial details for an agent
 */
export const updateAgentTrialDetails = async (
  agentId: string,
  trialEndDate: Date
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('agents_extended')
      .update({
        trial_end_date: trialEndDate.toISOString()
      })
      .eq('id', agentId);
      
    if (error) {
      console.error('Error updating agent trial details:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating agent trial details:', error);
    return false;
  }
};
