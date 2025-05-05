
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
}

export enum AgentTypeEnum {
  WHATSAPP = "whatsapp",
  TELEGRAM = "telegram",
  OTHER = "other"
}
