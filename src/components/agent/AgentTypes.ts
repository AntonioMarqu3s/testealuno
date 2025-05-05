
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
  // Added optional properties to avoid TypeScript errors
  group?: string;
  status?: string;
  typeId?: number;
  groupId?: string;
}

export enum AgentTypeEnum {
  WHATSAPP = "whatsapp",
  TELEGRAM = "telegram",
  OTHER = "other"
}
