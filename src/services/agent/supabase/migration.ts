
import { supabase } from '@/lib/supabase';
import { Agent } from '@/components/agent/AgentTypes';

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
