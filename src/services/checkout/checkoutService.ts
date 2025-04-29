
/**
 * Save checkout information for a user
 * @param email User email
 * @param checkoutCode Unique checkout code
 */
export const saveCheckoutInfo = (email: string, checkoutCode: string): void => {
  const checkoutData = localStorage.getItem('checkout_info') || '{}';
  const checkoutInfo = JSON.parse(checkoutData);
  
  // Add or update checkout info for this user
  checkoutInfo[email] = {
    code: checkoutCode,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };
  
  localStorage.setItem('checkout_info', JSON.stringify(checkoutInfo));
};

/**
 * Upgrade the user's plan to premium
 * @param email User email
 */
export const upgradeToPremium = (email: string): void => {
  const planData = localStorage.getItem('user_plans') || '{}';
  const userPlans = JSON.parse(planData);
  
  // Update the user's plan to premium (2)
  userPlans[email] = {
    plan: 2,
    name: "Premium",
    agentLimit: "Unlimited",
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('user_plans', JSON.stringify(userPlans));
};
