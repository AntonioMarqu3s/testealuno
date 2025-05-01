
export interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  createdAt: Date;
  instanceId?: string;
  clientIdentifier?: string;
}
