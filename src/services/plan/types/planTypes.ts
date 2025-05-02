
// Define plan types
export enum PlanType {
  FREE_TRIAL = 0,
  BASIC = 1,
  STANDARD = 2,
  PREMIUM = 3
}

// Define plan details
export const PLAN_DETAILS = {
  [PlanType.FREE_TRIAL]: { 
    name: 'Teste Gratuito', 
    agentLimit: 1, 
    price: 0,
    trialDays: 5 
  },
  [PlanType.BASIC]: { 
    name: 'Inicial', 
    agentLimit: 1, 
    price: 97.00
  },
  [PlanType.STANDARD]: { 
    name: 'Padrão', 
    agentLimit: 3, 
    price: 210.00
  },
  [PlanType.PREMIUM]: { 
    name: 'Premium', 
    agentLimit: 10, 
    price: 700.00
  }
};

// Define types for user plan
export interface UserPlan {
  plan: PlanType;
  name: string;
  agentLimit: number;
  trialEndsAt?: string; // ISO date string for trial expiration
  subscriptionEndsAt?: string; // ISO date string for subscription expiration
  paymentDate?: string; // ISO date string for last payment
  paymentStatus?: string; // Status of payment: 'pending', 'completed', 'failed'
  connectInstancia?: boolean; // Flag to indicate if user has connection to instancia
  updatedAt: string;
}
