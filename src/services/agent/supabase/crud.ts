
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
  agentType: string,
  instanceId: string,
  clientIdentifier: string,
  isConnected: boolean = false
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
      user_id: userId, // Use UUID, not email
      name: values.agentName,
      type: agentType,
      is_connected: isConnected,
      connect_instancia: isConnected,
      instance_id: instanceId,
      client_identifier: clientIdentifier,
      agent_data: {
        // Store all form data in agent_data
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
    };

    // Log the data we're saving
    console.log('Saving agent data to Supabase:', agentData);
    
    // Use upsert to create or update the agent
    const { error } = await supabase
      .from('agents')
      .upsert(agentData);
      
    if (error) {
      console.error('Error saving agent to Supabase:', error);
      return false;
    }
    
    // Now save extended agent data
    // Calculate some default dates for extended info
    const startDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 5); // 5 day trial period
    
    // Create extended data
    const extendedSaved = await saveExtendedAgentData({
      id: agentId,
      name: values.agentName,
      userId,
      type: agentType,
      isConnected,
      createdAt: startDate,
      instanceId,
      clientIdentifier
    }, {
      startDate,
      trialEndDate,
      email: userEmail, // Use email for the email field
      instance_name: instanceId
    });
    
    if (!extendedSaved) {
      console.warn('Extended agent data could not be saved');
    }
    
    console.log('Successfully saved agent data to Supabase');
    return true;
  } catch (error) {
    console.error('Exception saving agent to Supabase:', error);
    return false;
  }
};
