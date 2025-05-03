import { supabase } from '@/lib/supabase';
import { Agent } from '@/components/agent/AgentTypes';
import { toast } from 'sonner';

/**
 * Fetches all agents for a specific user from Supabase
 */
export const fetchUserAgents = async (userId: string): Promise<Agent[]> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching agents from Supabase:', error);
      throw error;
    }
    
    // Map Supabase data to Agent type
    return data.map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      isConnected: agent.is_connected || false,
      createdAt: new Date(agent.created_at || Date.now()),
      instanceId: agent.instance_id,
      clientIdentifier: agent.client_identifier,
      connectInstancia: agent.connect_instancia || false,
      // Copy all properties from agent_data if it exists
      ...(agent.agent_data || {}),
      // Keep reference to original agent_data
      agent_data: agent.agent_data || {},
    }));
  } catch (error) {
    console.error('Exception fetching agents:', error);
    toast.error("Erro ao carregar agentes do banco de dados");
    return [];
  }
};

/**
 * Fetches a single agent by ID from Supabase
 */
export const fetchAgentById = async (agentId: string): Promise<Agent | null> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching agent from Supabase:', error);
      throw error;
    }
    
    if (!data) return null;
    
    // Map Supabase data to Agent type
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      isConnected: data.is_connected || false,
      createdAt: new Date(data.created_at || Date.now()),
      instanceId: data.instance_id,
      clientIdentifier: data.client_identifier,
      connectInstancia: data.connect_instancia || false,
      // Copy all properties from agent_data if it exists
      ...(data.agent_data || {}),
      // Keep reference to original agent_data
      agent_data: data.agent_data || {},
    };
  } catch (error) {
    console.error('Exception fetching agent by ID:', error);
    toast.error("Erro ao carregar dados do agente");
    return null;
  }
};

/**
 * Test Supabase connection and table access
 */
export const testAgentsTableAccess = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('id')
      .limit(1);
      
    if (error) {
      if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
        // This is expected for users without agents due to RLS
        console.log('Expected permission denied due to RLS, connection is working');
        return true;
      }
      
      console.error('Error testing agents table access:', error);
      return false;
    }
    
    console.log('Successfully accessed agents table');
    return true;
  } catch (error) {
    console.error('Exception testing agents table access:', error);
    return false;
  }
};
