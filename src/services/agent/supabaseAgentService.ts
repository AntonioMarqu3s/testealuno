
import { supabase } from '@/lib/supabase';
import { Agent } from './agentStorageService';
import { Tables } from '@/lib/supabase';

// Get all agents for a user from Supabase
export const getSupabaseAgents = async (userId: string): Promise<Agent[]> => {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agents from Supabase:', error);
    return [];
  }

  return data.map((agent: Tables['agents']) => ({
    id: agent.id,
    name: agent.name,
    type: agent.type,
    isConnected: agent.is_connected,
    createdAt: new Date(agent.created_at),
    instanceId: agent.instance_id,
    clientIdentifier: agent.client_identifier
  }));
};

// Save a new agent to Supabase
export const saveAgentToSupabase = async (userId: string, agent: Agent): Promise<string | null> => {
  const { data, error } = await supabase
    .from('agents')
    .insert([{
      id: agent.id,
      user_id: userId,
      name: agent.name,
      type: agent.type,
      is_connected: agent.isConnected,
      created_at: agent.createdAt.toISOString(),
      instance_id: agent.instanceId,
      client_identifier: agent.clientIdentifier
    }])
    .select('id')
    .single();

  if (error) {
    console.error('Error saving agent to Supabase:', error);
    return null;
  }

  return data.id;
};

// Update an agent in Supabase
export const updateAgentInSupabase = async (userId: string, agentId: string, updates: Partial<Agent>): Promise<boolean> => {
  // Convert to snake_case for the database
  const dbUpdates: Partial<Tables['agents']> = {};
  
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.type) dbUpdates.type = updates.type;
  if (updates.isConnected !== undefined) dbUpdates.is_connected = updates.isConnected;
  if (updates.instanceId) dbUpdates.instance_id = updates.instanceId;
  if (updates.clientIdentifier) dbUpdates.client_identifier = updates.clientIdentifier;
  
  const { error } = await supabase
    .from('agents')
    .update(dbUpdates)
    .eq('id', agentId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating agent in Supabase:', error);
    return false;
  }

  return true;
};

// Delete an agent from Supabase
export const deleteAgentFromSupabase = async (userId: string, agentId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting agent from Supabase:', error);
    return false;
  }

  return true;
};

// Migrate local agents to Supabase
export const migrateAgentsToSupabase = async (userId: string, email: string, localAgents: Agent[]): Promise<void> => {
  if (!localAgents.length) return;
  
  // Check which agents already exist in Supabase to avoid duplicates
  const { data: existingAgents, error: fetchError } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', userId);
    
  if (fetchError) {
    console.error('Error checking existing agents:', fetchError);
    return;
  }
  
  const existingIds = new Set(existingAgents?.map(agent => agent.id) || []);
  
  // Filter out agents that already exist
  const newAgents = localAgents.filter(agent => !existingIds.has(agent.id));
  
  if (newAgents.length === 0) return;
  
  // Prepare agents data for insertion
  const agentsToInsert = newAgents.map(agent => ({
    id: agent.id,
    user_id: userId,
    name: agent.name,
    type: agent.type,
    is_connected: agent.isConnected,
    created_at: agent.createdAt.toISOString(),
    instance_id: agent.instanceId,
    client_identifier: agent.clientIdentifier || `${email}-${agent.name}`.replace(/\s+/g, '-').toLowerCase()
  }));
  
  // Insert agents in batches if needed
  const { error: insertError } = await supabase
    .from('agents')
    .insert(agentsToInsert);
    
  if (insertError) {
    console.error('Error migrating agents to Supabase:', insertError);
  }
};
