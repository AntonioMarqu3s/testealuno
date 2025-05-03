
import { supabase } from '@/lib/supabase';
import { Agent } from '@/components/agent/AgentTypes';
import { AgentFormValues } from '@/components/agent/form/agentSchema';

/**
 * Migrate agents from localStorage to Supabase
 */
export const migrateAgentsToSupabase = async (userId: string, email: string, agents: Agent[]): Promise<void> => {
  if (!agents || agents.length === 0) return;
  
  // Check if user already has agents in Supabase
  const { data, error } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error checking existing agents:', error);
    return;
  }
  
  if (data && data.length > 0) {
    // Agents already exist, no need to migrate
    return;
  }
  
  // Prepare agents for Supabase insert
  const supabaseAgents = agents.map(agent => ({
    id: agent.id,
    user_id: userId,
    name: agent.name,
    type: agent.type,
    is_connected: agent.isConnected,
    connect_instancia: agent.connectInstancia || agent.isConnected, // Default to isConnected if not set
    created_at: new Date(agent.createdAt).toISOString(),
    instance_id: agent.instanceId,
    client_identifier: agent.clientIdentifier,
    agent_data: {
      // Include any additional agent data if available
      personality: agent.personality,
      customPersonality: agent.customPersonality,
      companyName: agent.companyName,
      companyDescription: agent.companyDescription,
      segment: agent.segment,
      mission: agent.mission,
      vision: agent.vision,
      mainDifferentials: agent.mainDifferentials,
      competitors: agent.competitors,
      commonObjections: agent.commonObjections,
      productName: agent.productName,
      productDescription: agent.productDescription,
      problemsSolved: agent.problemsSolved,
      benefits: agent.benefits,
      differentials: agent.differentials
    }
  }));
  
  // Insert agents
  const { error: insertError } = await supabase
    .from('agents')
    .insert(supabaseAgents);
    
  if (insertError) {
    console.error('Error migrating agents to Supabase:', insertError);
  }
};

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

/**
 * Delete agent from Supabase
 */
export const deleteAgentFromSupabase = async (agentId: string): Promise<boolean> => {
  try {
    // Check if agent exists in Supabase first
    const { data: checkData, error: checkError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', agentId);
      
    // If agent doesn't exist or we get an error, return success anyway
    // This allows local deletion to proceed even if not in Supabase yet
    if (checkError || !checkData || checkData.length === 0) {
      console.log('Agent not found in database, skipping database deletion');
      return true;
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
  userId: string, 
  values: AgentFormValues,
  agentType: string,
  instanceId: string,
  clientIdentifier: string,
  isConnected: boolean = false
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('agents')
      .upsert({
        id: agentId,
        user_id: userId,
        name: values.agentName,
        type: agentType,
        is_connected: isConnected,
        connect_instancia: isConnected,
        instance_id: instanceId,
        client_identifier: clientIdentifier,
        agent_data: {
          personality: values.personality,
          customPersonality: values.customPersonality,
          companyName: values.companyName,
          companyDescription: values.companyDescription,
          segment: values.segment,
          mission: values.mission,
          vision: values.vision,
          mainDifferentials: values.mainDifferentials,
          competitors: values.competitors,
          commonObjections: values.commonObjections,
          productName: values.productName,
          productDescription: values.productDescription,
          problemsSolved: values.problemsSolved,
          benefits: values.benefits,
          differentials: values.differentials
        }
      });
      
    if (error) {
      console.error('Error saving agent to Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception saving agent to Supabase:', error);
    return false;
  }
};
