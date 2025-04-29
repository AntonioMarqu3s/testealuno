
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

// Get current user email (in a real app would come from auth system)
export const getCurrentUserEmail = (): string => {
  // First try to get from localStorage (simulating a logged-in user)
  const savedEmail = localStorage.getItem(USER_EMAIL_KEY);
  
  // If no email is saved, create a new one and save it
  if (!savedEmail) {
    const defaultEmail = 'usuario@exemplo.com';
    localStorage.setItem(USER_EMAIL_KEY, defaultEmail);
    // Make sure to synchronize with any user instance data
    syncUserEmail(defaultEmail);
    return defaultEmail;
  }
  
  return savedEmail;
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
};

// Update agent instance IDs with new email
const updateUserAgentInstances = (oldEmail: string, newEmail: string): void => {
  const storedAgents = localStorage.getItem('user_agents');
  if (!storedAgents) return;
  
  const agents = JSON.parse(storedAgents);
  
  // Update instanceId for each agent
  const updatedAgents = agents.map((agent: any) => {
    if (agent.instanceId && agent.instanceId.startsWith(`${oldEmail}-`)) {
      // Create new instanceId with the new email
      const agentName = agent.instanceId.substring(oldEmail.length + 1);
      const newInstanceId = generateInstanceId(newEmail, agentName);
      return {
        ...agent,
        instanceId: newInstanceId
      };
    }
    return agent;
  });
  
  // Save updated agents
  localStorage.setItem('user_agents', JSON.stringify(updatedAgents));
};

// Sync user email across all relevant storage locations
const syncUserEmail = (email: string): void => {
  // Update user_agents if they exist
  const storedAgents = localStorage.getItem('user_agents');
  if (storedAgents) {
    const agents = JSON.parse(storedAgents);
    
    // Update instanceId for each agent to use the correct email
    const updatedAgents = agents.map((agent: any) => {
      if (agent.name) {
        return {
          ...agent,
          instanceId: generateInstanceId(email, agent.name)
        };
      }
      return agent;
    });
    
    // Save updated agents
    localStorage.setItem('user_agents', JSON.stringify(updatedAgents));
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
