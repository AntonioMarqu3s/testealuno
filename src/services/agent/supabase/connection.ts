
import { supabase } from '@/lib/supabase';

/**
 * Update agent connection status in Supabase
 */
export const updateAgentConnectionStatus = async (agentId: string, isConnected: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('agents')
      .update({ 
        is_connected: isConnected,
        connect_instancia: isConnected // Update both fields to stay in sync
      })
      .eq('id', agentId);
      
    if (error) {
      console.error('Error updating agent connection status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating agent connection status:', error);
    return false;
  }
};

/**
 * Get agent connection status from Supabase
 */
export const getAgentConnectionStatus = async (agentId: string): Promise<boolean> => {
  try {
    // First check if agent exists in database
    const { data: checkData, error: checkError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', agentId);
      
    if (checkError || !checkData || checkData.length === 0) {
      console.log('Agent not found in database, returning default connection status');
      return false;
    }
    
    // Then get connection status
    const { data, error } = await supabase
      .from('agents')
      .select('connect_instancia')
      .eq('id', agentId)
      .maybeSingle();
      
    if (error) {
      console.error('Error getting agent connection status:', error);
      return false;
    }
    
    return data?.connect_instancia || false;
  } catch (error) {
    console.error('Exception getting agent connection status:', error);
    return false;
  }
};
