
import { PlanType } from "@/services/plan/types/planTypes";
import { getTrialDaysRemaining, getSubscriptionDaysRemaining } from "@/services/plan/userPlanService";

// Format dates for display
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Get days remaining (either trial or subscription)
export const getDaysRemaining = (userEmail: string, planType?: PlanType): number => {
  if (!userEmail) return 0;
  
  if (planType === PlanType.FREE_TRIAL) {
    return getTrialDaysRemaining(userEmail);
  } else {
    return getSubscriptionDaysRemaining(userEmail);
  }
};

// Get plan expiration date
export const getExpirationDate = (plan: any): string => {
  if (!plan) return "N/A";
  
  if (plan.plan === PlanType.FREE_TRIAL && plan.trialEndsAt) {
    return formatDate(plan.trialEndsAt);
  } else if (plan.subscriptionEndsAt) {
    return formatDate(plan.subscriptionEndsAt);
  }
  
  return "N/A";
};

// Get plan start date
export const getPlanStartDate = (plan: any): string => {
  if (!plan) return "N/A";

  if (plan.paymentDate) {
    return formatDate(plan.paymentDate);
  } else if (plan.updatedAt) {
    // Use updatedAt as fallback for start date
    return formatDate(plan.updatedAt);
  }
  
  return "N/A";
};
