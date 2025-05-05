
export interface AgentExtended {
  id: string;
  user_id: string;
  name: string;
  is_connected: boolean;
  instance_name?: string;
  email?: string;
  plan_id?: number;
  start_date?: string;
  plan_end_date?: string;
  trial_end_date?: string;
  payment_date?: string;
  discount_coupon?: string;
  // Convenience properties with proper date types
  startDate?: Date;
  planEndDate?: Date;
  trialEndDate?: Date;
  paymentDate?: Date;
  planId?: number;
  discountCoupon?: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  createdAt: Date;
  instanceId: string;
  clientIdentifier?: string;
  connectInstancia?: boolean;
  userId: string;
  group?: string;
  status?: string;
  typeId?: number;
  groupId?: string;
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
    [key: string]: any;
  };
  // Convenience getters for agent_data properties
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
  // Add extended data support
  extended?: AgentExtended;
}

export enum AgentTypeEnum {
  WHATSAPP = "whatsapp",
  TELEGRAM = "telegram",
  OTHER = "other"
}
