
export interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  createdAt: Date;
  instanceId: string;
  clientIdentifier?: string;
  connectInstancia?: boolean;
}

// Adding this enum to standardize agent types across the application
export enum AgentTypeEnum {
  SALES = "sales",
  SDR = "sdr",
  CLOSER = "closer",
  SUPPORT = "support",
  BROADCAST = "broadcast",
  SECRETARY = "secretary",
  HELPDESK = "helpdesk", // Added new helpdesk agent type
  SCHOOL = "school", // Added school agent type
  CUSTOM = "custom"
}
