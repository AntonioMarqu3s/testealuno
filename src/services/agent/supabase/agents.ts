import { supabase } from '@/lib/supabase';
import { Agent } from '@/components/agent/AgentTypes';
import { toast } from 'sonner';
import { fetchExtendedAgentData } from './extended';
import { getCurrentUser } from '@/services/auth/supabaseAuth';

/**
 * Fetches all agents for a specific user from Supabase
 */
export const fetchUserAgents = async (userIdentifier: string): Promise<Agent[]> => {
  try {
    let userId = userIdentifier;
    if (userIdentifier.includes('@')) {
      const user = await getCurrentUser();
      if (user) {
        userId = user.id;
      } else {
        console.error('Cannot fetch agents: No authenticated user found');
        return [];
      }
    }
    // Buscar agentes na nova tabela 'agentes'
    const { data, error } = await supabase
      .from('agentes')
      .select(`
        *,
        tipo:tipo_id (nome),
        grupo:grupo_id (nome)
      `)
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching agents from Supabase:', error);
      throw error;
    }
    // Mapear dados para o tipo Agent
    const agents = (data || []).map(agent => ({
      id: agent.id,
      name: agent.nome,
      type: agent.tipo?.nome || '',
      group: agent.grupo?.nome || '',
      status: agent.status,
      createdAt: new Date(agent.created_at || Date.now()),
      updatedAt: agent.updated_at ? new Date(agent.updated_at) : undefined,
      userId: agent.user_id,
      typeId: agent.tipo_id,
      groupId: agent.grupo_id,
    }));
    return agents;
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
      .from('agentes')
      .select(`
        *,
        tipo:tipo_id (nome),
        grupo:grupo_id (nome)
      `)
      .eq('id', agentId)
      .maybeSingle();
    if (error) {
      console.error('Error fetching agent from Supabase:', error);
      throw error;
    }
    if (!data) return null;
    const agent: Agent = {
      id: data.id,
      name: data.nome,
      type: data.tipo?.nome || '',
      group: data.grupo?.nome || '',
      status: data.status,
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      userId: data.user_id,
      typeId: data.tipo_id,
      groupId: data.grupo_id,
    };
    return agent;
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
      .from('agentes')
      .select('id')
      .limit(1);
    if (error) {
      if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
        console.log('Expected permission denied due to RLS, connection is working');
        return true;
      }
      console.error('Error testing agentes table access:', error);
      return false;
    }
    console.log('Successfully accessed agentes table');
    return true;
  } catch (error) {
    console.error('Exception testing agentes table access:', error);
    return false;
  }
};
