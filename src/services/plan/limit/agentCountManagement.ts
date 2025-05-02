
/**
 * Update agent count for tracking purposes
 * This doesn't actually limit creation, just tracks the number
 * @param email User email
 */
export const incrementAgentCount = (email: string): void => {
  // This is now a tracking function only
  // The actual limit check is done in canCreateAgent
  console.log(`Agent count incremented for user: ${email}`);
  // In a real app, this would update a counter in the database
};

/**
 * Decrease agent count when an agent is deleted
 * @param email User email
 */
export const decrementAgentCount = (email: string): void => {
  // This is now a tracking function only
  console.log(`Agent count decremented for user: ${email}`);
  // In a real app, this would update a counter in the database
};
