
// Simulating database storage for user plans
interface UserPlan {
  email: string;
  plano: number; // 1 = basic (1 agent), 2 = premium (unlimited agents)
  agentCount: number;
  checkout?: string; // URL or code for checkout (admin use)
}

// Use localStorage as a simple database
const STORAGE_KEY = 'user_plans';

// Get current user email (in a real app would come from auth system)
export const getCurrentUserEmail = (): string => {
  // First try to get from localStorage (simulating a logged-in user)
  const savedEmail = localStorage.getItem('current_user_email');
  
  // If no email is saved, create a new one and save it
  if (!savedEmail) {
    const defaultEmail = 'user@example.com';
    localStorage.setItem('current_user_email', defaultEmail);
    return defaultEmail;
  }
  
  return savedEmail;
};

// Update current user email
export const updateCurrentUserEmail = (email: string): void => {
  localStorage.setItem('current_user_email', email);
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
