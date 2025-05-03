
import { supabase } from '@/lib/supabase';
import { AgentFormValues } from '@/components/agent/form/agentSchema';
import { saveExtendedAgentData } from './extended';

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
    
    // Delete agent from Supabase (cascade will delete from agents_extended too)
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
    // Create an agent object with all values to be saved in Supabase
    const agentData = {
      id: agentId,
      user_id: userId,
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
      email: userId, // Use userId as email temporarily
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
