export interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  createdAt: Date;
  instanceId: string;
  instanceName?: string;
  clientIdentifier?: string;
  connectInstancia?: boolean;
  userId?: string; // Add userId for better type safety
  // Form data fields
  personality?: string;
  customPersonality?: string;
  companyName?: string;
  companyDescription?: string;
  segment?: string;
  mission?: string;
  vision?: string;
  mainDifferentials?: string;
  competitors?: string;
  commonObjections?: string;
  productName?: string;
  productDescription?: string;
  problemsSolved?: string;
  benefits?: string;
  differentials?: string;
  // For Supabase integration - contains all form fields
  agent_data?: {
    personality?: string;
    customPersonality?: string;
    companyName?: string;
    companyDescription?: string;
    segment?: string;
    mission?: string;
    vision?: string;
    mainDifferentials?: string;
    competitors?: string;
    commonObjections?: string;
    productName?: string;
    productDescription?: string;
    problemsSolved?: string;
    benefits?: string;
    differentials?: string;
  };
  // Extended data (from agents_extended table)
  extended?: AgentExtended;
}

// New interface for the agents_extended table
export interface AgentExtended {
  id: string;
  user_id: string;
  name: string;
  plan_id?: number;
  is_connected: boolean;
  start_date?: string;
  plan_end_date?: string;
  discount_coupon?: string;
  trial_end_date?: string;
  instance_name?: string;
  email?: string;
  payment_date?: string;
  
  // Convenience properties with parsed dates
  startDate?: Date;
  planEndDate?: Date;
  trialEndDate?: Date;
  paymentDate?: Date;
  planId?: number;
  discountCoupon?: string;
}

// Adding this enum to standardize agent types across the application
export enum AgentTypeEnum {
  SALES = "sales",
  SDR = "sdr",
  CLOSER = "closer",
  SUPPORT = "support",
  BROADCAST = "broadcast",
  CUSTOM = "custom"
}
