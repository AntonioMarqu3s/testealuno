
// Simulating database storage for user plans
interface UserPlan {
  email: string;
  plano: number; // 1 = basic (1 agent), 2 = premium (unlimited agents)
  agentCount: number;
  checkout?: string; // URL or code for checkout (admin use)
}

// Use localStorage as a simple database
const STORAGE_KEY = 'user_plans';
const USER_EMAIL_KEY = 'current_user_email';
const ALL_AGENTS_KEY = 'all_agents';

// Get current user email (in a real app would come from auth system)
export const getCurrentUserEmail = (): string => {
  // First try to get from localStorage (simulating a logged-in user)
  const savedEmail = localStorage.getItem(USER_EMAIL_KEY);
  
  // If no email is saved, create a new one and save it
  if (!savedEmail) {
    const defaultEmail = 'usuario@exemplo.com';
    localStorage.setItem(USER_EMAIL_KEY, defaultEmail);
    // Make sure to initialize user data
    initializeUserData(defaultEmail);
    return defaultEmail;
  }
  
  return savedEmail;
};

// Initialize user data if it doesn't exist
const initializeUserData = (email: string): void => {
  // Initialize user plan if it doesn't exist
  const plansData = localStorage.getItem(STORAGE_KEY);
  const plans: Record<string, UserPlan> = plansData ? JSON.parse(plansData) : {};
  
  if (!plans[email]) {
    plans[email] = {
      email,
      plano: 1, // Basic plan
      agentCount: 0
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }
  
  // Initialize agents array if it doesn't exist
  const allAgentsData = localStorage.getItem(ALL_AGENTS_KEY);
  const allAgents: Record<string, any[]> = allAgentsData ? JSON.parse(allAgentsData) : {};
  
  if (!allAgents[email]) {
    allAgents[email] = [];
    localStorage.setItem(ALL_AGENTS_KEY, JSON.stringify(allAgents));
  }
};

// Update current user email
export const updateCurrentUserEmail = (email: string): void => {
  const oldEmail = localStorage.getItem(USER_EMAIL_KEY);
  
  // Update the email in localStorage
  localStorage.setItem(USER_EMAIL_KEY, email);
  
  // If there was a previous email, update all references to it
  if (oldEmail && oldEmail !== email) {
    // Transfer any existing plan data to the new email
    transferUserPlanData(oldEmail, email);
    
    // Update any agent instance IDs
    updateUserAgentInstances(oldEmail, email);
  } else {
    // Initialize user data if it's a new email
    initializeUserData(email);
  }
};

// Transfer user plan data from old email to new email
const transferUserPlanData = (oldEmail: string, newEmail: string): void => {
  const plansData = localStorage.getItem(STORAGE_KEY);
  if (!plansData) return;
  
  const plans: Record<string, UserPlan> = JSON.parse(plansData);
  
  // If the old email had a plan, transfer it to the new email
  if (plans[oldEmail]) {
    plans[newEmail] = {
      ...plans[oldEmail],
      email: newEmail
    };
    
    // Remove the old email plan
    delete plans[oldEmail];
    
    // Save updated plans
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }
  
  // Transfer agent data if exists
  const allAgentsData = localStorage.getItem(ALL_AGENTS_KEY);
  if (allAgentsData) {
    const allAgents: Record<string, any[]> = JSON.parse(allAgentsData);
    
    // If the old email had agents, transfer them to the new email
    if (allAgents[oldEmail]) {
      allAgents[newEmail] = allAgents[oldEmail].map(agent => ({
        ...agent,
        instanceId: generateInstanceId(newEmail, agent.name)
      }));
      
      // Remove the old email agents
      delete allAgents[oldEmail];
      
      // Save updated agents
      localStorage.setItem(ALL_AGENTS_KEY, JSON.stringify(allAgents));
    } else {
      // Initialize empty agents array
      allAgents[newEmail] = [];
      localStorage.setItem(ALL_AGENTS_KEY, JSON.stringify(allAgents));
    }
  }
};

// Update agent instance IDs with new email
const updateUserAgentInstances = (oldEmail: string, newEmail: string): void => {
  const allAgentsData = localStorage.getItem(ALL_AGENTS_KEY);
  if (!allAgentsData) return;
  
  const allAgents: Record<string, any[]> = JSON.parse(allAgentsData);
  
  // Update instanceId for each agent of the old email
  if (allAgents[oldEmail]) {
    allAgents[newEmail] = allAgents[oldEmail].map(agent => ({
      ...agent,
      instanceId: generateInstanceId(newEmail, agent.name)
    }));
    
    // Remove old email agents
    delete allAgents[oldEmail];
    
    // Save updated agents
    localStorage.setItem(ALL_AGENTS_KEY, JSON.stringify(allAgents));
  }
};

// Get current user's plan
export const getUserPlan = (email: string): UserPlan => {
  const plansData = localStorage.getItem(STORAGE_KEY);
  const plans: Record<string, UserPlan> = plansData ? JSON.parse(plansData) : {};
  
  // If user doesn't exist, create a basic plan
  if (!plans[email]) {
    const newPlan: UserPlan = {
      email,
      plano: 1, // Basic plan
      agentCount: 0
    };
    plans[email] = newPlan;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }
  
  return plans[email];
};

// Increment agent count for user
export const incrementAgentCount = (email: string): UserPlan => {
  const plansData = localStorage.getItem(STORAGE_KEY);
  const plans: Record<string, UserPlan> = plansData ? JSON.parse(plansData) : {};
  
  const plan = plans[email] || { email, plano: 1, agentCount: 0 };
  plan.agentCount += 1;
  plans[email] = plan;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return plan;
};

// Check if user can create more agents
export const canCreateAgent = (email: string): boolean => {
  const plan = getUserPlan(email);
  
  // Basic plan (1) can only create 1 agent
  if (plan.plano === 1) {
    // Check number of actual agents for this user
    const allAgentsData = localStorage.getItem(ALL_AGENTS_KEY);
    if (allAgentsData) {
      const allAgents: Record<string, any[]> = JSON.parse(allAgentsData);
      const userAgents = allAgents[email] || [];
      return userAgents.length < 1;
    }
    return plan.agentCount < 1;
  }
  
  // Premium plan (2) can create unlimited agents
  return true;
};

// Generate instance ID (email + agent name)
export const generateInstanceId = (email: string, agentName: string): string => {
  if (!email || !agentName) return "";
  return `${email}-${agentName}`.replace(/\s+/g, '-').toLowerCase();
};

// Save agent to localStorage
export const saveAgent = (email: string, agent: any): void => {
  const allAgentsData = localStorage.getItem(ALL_AGENTS_KEY);
  const allAgents: Record<string, any[]> = allAgentsData ? JSON.parse(allAgentsData) : {};
  
  // Get or initialize agents for this email
  const userAgents = allAgents[email] || [];
  
  // Add new agent at the beginning of the array
  userAgents.unshift(agent);
  
  // Save back to localStorage
  allAgents[email] = userAgents;
  localStorage.setItem(ALL_AGENTS_KEY, JSON.stringify(allAgents));
};

// Get all agents for a user
export const getUserAgents = (email: string): any[] => {
  const allAgentsData = localStorage.getItem(ALL_AGENTS_KEY);
  if (!allAgentsData) return [];
  
  const allAgents: Record<string, any[]> = JSON.parse(allAgentsData);
  return allAgents[email] || [];
};

// Delete agent for a user
export const deleteUserAgent = (email: string, agentId: string): void => {
  const allAgentsData = localStorage.getItem(ALL_AGENTS_KEY);
  if (!allAgentsData) return;
  
  const allAgents: Record<string, any[]> = JSON.parse(allAgentsData);
  const userAgents = allAgents[email] || [];
  
  // Filter out the agent with the specified ID
  const updatedAgents = userAgents.filter(agent => agent.id !== agentId);
  
  // Save back to localStorage
  allAgents[email] = updatedAgents;
  localStorage.setItem(ALL_AGENTS_KEY, JSON.stringify(allAgents));
};

// Save checkout information (for admin)
export const saveCheckoutInfo = (email: string, checkoutCode: string): void => {
  const plansData = localStorage.getItem(STORAGE_KEY);
  const plans: Record<string, UserPlan> = plansData ? JSON.parse(plansData) : {};
  
  const plan = plans[email] || { email, plano: 1, agentCount: 0 };
  plan.checkout = checkoutCode;
  plans[email] = plan;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
};

// Upgrade to premium (simulate)
export const upgradeToPremium = (email: string): void => {
  const plansData = localStorage.getItem(STORAGE_KEY);
  const plans: Record<string, UserPlan> = plansData ? JSON.parse(plansData) : {};
  
  const plan = plans[email] || { email, plano: 1, agentCount: 0 };
  plan.plano = 2; // Premium
  plans[email] = plan;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
};
