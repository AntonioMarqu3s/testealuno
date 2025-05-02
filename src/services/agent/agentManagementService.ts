
import { getStorageItem, setStorageItem } from '../storage/localStorageService';
import { Agent } from '@/components/agent/AgentTypes';
import { deleteWhatsAppInstance } from './webhookService';
import { deleteAgentFromSupabase } from './supabaseAgentService';
import { getUserAgents, saveAgent } from './agentStorageOperations';

/**
 * Delete a user agent
 * @param userEmail User email
 * @param agentId Agent ID to delete
 * @returns True if deletion was successful
 */
export const deleteUserAgent = async (userEmail: string, agentId: string): Promise<boolean> => {
  try {
    console.log(`Deleting agent ${agentId} for user ${userEmail}`);
    
    // Get the agent to be deleted
    const allAgents = getUserAgents(userEmail);
    const agentToDelete = allAgents.find(agent => agent.id === agentId);
    
    if (!agentToDelete) {
      console.error(`Agent ${agentId} not found for user ${userEmail}`);
      return false;
    }
    
    // Delete WhatsApp instance using webhook
    if (agentToDelete.instanceId) {
      try {
        console.log(`Deleting WhatsApp instance: ${agentToDelete.instanceId}`);
        await deleteWhatsAppInstance(agentToDelete.instanceId);
      } catch (e) {
        console.error(`Error deleting WhatsApp instance: ${e}`);
        // Continue with deletion even if webhook fails
      }
    }
    
    // Delete agent from Supabase (if applicable)
    try {
      await deleteAgentFromSupabase(agentId);
    } catch (e) {
      console.error(`Error deleting agent from Supabase: ${e}`);
      // Continue with deletion even if Supabase deletion fails
    }
    
    // Delete agent from local storage
    const updatedAgents = allAgents.filter(agent => agent.id !== agentId);
    const agentsData = getStorageItem<Record<string, Agent[]>>('user_agents', {});
    agentsData[userEmail] = updatedAgents;
    setStorageItem('user_agents', agentsData);
    
    return true;
  } catch (error) {
    console.error('Error deleting user agent:', error);
    return false;
  }
};

/**
 * Update a user agent with partial data
 * @param userEmail User email
 * @param agentId Agent ID to update
 * @param partialData Partial agent data to update
 * @returns True if update was successful
 */
export const updateUserAgent = (
  userEmail: string, 
  agentId: string, 
  partialData: Partial<Agent>
): boolean => {
  try {
    const agentsData = getStorageItem<Record<string, Agent[]>>('user_agents', {});
    const userAgents = agentsData[userEmail] || [];
    
    const agentIndex = userAgents.findIndex(agent => agent.id === agentId);
    if (agentIndex === -1) {
      console.error(`Agent ${agentId} not found for user ${userEmail}`);
      return false;
    }
    
    // Update agent with partial data
    userAgents[agentIndex] = {
      ...userAgents[agentIndex],
      ...partialData
    };
    
    agentsData[userEmail] = userAgents;
    setStorageItem('user_agents', agentsData);
    
    return true;
  } catch (error) {
    console.error('Error updating user agent:', error);
    return false;
  }
};

/**
 * Transfer user agent data from an old email to a new email
 * @param oldEmail Old user email
 * @param newEmail New user email
 */
export const transferUserAgentData = (oldEmail: string, newEmail: string): void => {
  const agentsData = getStorageItem<Record<string, Agent[]>>('user_agents', {});
  
  // If the old email has agent data, copy it to the new email
  if (agentsData[oldEmail]) {
    console.log(`Transferring agent data from ${oldEmail} to ${newEmail}`);
    agentsData[newEmail] = [...agentsData[oldEmail]];
    
    // Optionally, remove the old email entry
    delete agentsData[oldEmail];
    
    // Save the updated agent data
    setStorageItem('user_agents', agentsData);
  } else {
    // If no data for old email, initialize for new email
    saveAgent(newEmail, []);
  }
};
