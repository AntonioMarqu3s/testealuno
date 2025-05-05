import { supabase } from '@/lib/supabase';
import { AgentFormValues } from '@/components/agent/form/agentSchema';
import { saveExtendedAgentData } from './extended';
import { getCurrentUser } from '@/services/auth/supabaseAuth';

/**
 * Delete agent from Supabase
 */
export const deleteAgentFromSupabase = async (agentId: string): Promise<boolean> => {
  try {
    console.log('Starting Supabase agent deletion for ID:', agentId);
    
    // First delete the extended data
    const { error: extendedError } = await supabase
      .from('agents_extended')
      .delete()
      .eq('id', agentId);
      
    if (extendedError) {
      console.error('Error deleting extended agent data from Supabase:', extendedError);
      // Continue anyway to try deleting the main record
    } else {
      console.log('Successfully deleted agent extended data from Supabase');
    }
    
    // Delete agent from Supabase
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', agentId);
      
    if (error) {
      console.error('Error deleting agent from Supabase:', error);
      return false;
    }
    
    console.log('Successfully deleted agent from Supabase');
    return true;
  } catch (error) {
    console.error('Exception deleting agent from Supabase:', error);
    return false;
  }
};

/**
 * Save agent form data to Supabase
 */
export const saveAgentToSupabase = async (
  agentId: string, 
  userEmail: string, 
  values: AgentFormValues,
  tipoId: number,
  grupoId: string,
  status: string = 'ativo'
): Promise<boolean> => {
  try {
    // Get the actual user ID from Supabase auth
    const user = await getCurrentUser();
    if (!user) {
      console.error('Cannot save agent: No authenticated user found');
      return false;
    }
    const userId = user.id;

    // Create an agent object with all values to be saved in Supabase
    const agentData = {
      id: agentId,
      user_id: userId,
      nome: values.agentName,
      tipo_id: tipoId,
      grupo_id: grupoId,
      status: status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Log the data we're saving
    console.log('Saving agent data to Supabase:', agentData);
    
    // Use upsert to create or update the agent
    const { error } = await supabase
      .from('agentes')
      .upsert(agentData);
    
    if (error) {
      console.error('Error saving agent to Supabase:', error);
      return false;
    }
    
    console.log('Successfully saved agent data to Supabase');
    return true;
  } catch (error) {
    console.error('Exception saving agent to Supabase:', error);
    return false;
  }
};
