
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
    created_at: new Date(agent.createdAt).toISOString(),
    instance_id: agent.instanceId,
    client_identifier: agent.clientIdentifier
  }));
  
  // Insert agents
  const { error: insertError } = await supabase
    .from('agents')
    .insert(supabaseAgents);
    
  if (insertError) {
    console.error('Error migrating agents to Supabase:', insertError);
  }
};
