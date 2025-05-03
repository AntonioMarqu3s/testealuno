
export interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  createdAt: Date;
  instanceId: string;
  clientIdentifier?: string;
  connectInstancia?: boolean;
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
