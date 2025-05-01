
import { toast } from 'sonner';

/**
 * API functions for agent connection operations
 */

// Disconnect agent instance
export const disconnectInstance = async (instanceId?: string): Promise<boolean> => {
  if (!instanceId) {
    toast.error("ID da instância não encontrado");
    return false;
  }
  
  console.log("Disconnecting instance:", instanceId);
  
  try {
    // Updated disconnect webhook URL
    const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/desconectar-instancia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instanceId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to disconnect instance');
    }
    
    const data = await response.json();
    console.log("Disconnect response:", data);
    
    toast.success("Agente desconectado com sucesso");
    return true;
    
  } catch (error) {
    console.error("Error disconnecting agent:", error);
    toast.error("Erro ao desconectar agente");
    return false;
  }
};

// Check connection status
export const checkInstanceStatus = async (instanceId?: string): Promise<boolean> => {
  if (!instanceId) return false;
  
  try {
    console.log("Checking connection status for instance:", instanceId);
    // Updated status check webhook URL
    const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/verificar-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instanceId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to check connection status');
    }
    
    const data = await response.json();
    console.log("Connection status response:", data);
    
    return data.status === 'connected' || data.isConnected === true;
  } catch (error) {
    console.error("Error checking connection status:", error);
    return false;
  }
};
