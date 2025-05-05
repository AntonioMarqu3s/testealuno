export interface Agent {
  id: string;
  name: string;
  type: string; // nome do tipo de agente (ex: vendedor, sdr, etc)
  group: string; // nome do grupo
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  typeId: number;
  groupId: string;
  isConnected?: boolean;
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
