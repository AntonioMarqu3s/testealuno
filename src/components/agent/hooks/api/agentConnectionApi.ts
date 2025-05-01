
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
    // Try the updated disconnect webhook URL
    try {
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
    } catch (primaryError) {
      // Try fallback URL if primary fails
      console.log("Primary disconnect endpoint failed, trying fallback...");
      const fallbackResponse = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/desconectar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!fallbackResponse.ok) {
        throw new Error('Failed to disconnect instance with fallback');
      }
      
      const data = await fallbackResponse.json();
      console.log("Fallback disconnect response:", data);
      
      toast.success("Agente desconectado com sucesso");
      return true;
    }
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
    
    // Try the primary endpoint first
    try {
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
    } catch (primaryError) {
      // Try fallback URL if primary fails
      console.log("Primary status check endpoint failed, trying fallback...");
      
      // Use a fallback check or mock for demo
      const fallbackResponse = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/verificar-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!fallbackResponse.ok) {
        // If both fail, use mock check that returns false in production, but in development
        // we can simulate random connected status
        if (process.env.NODE_ENV === 'development') {
          console.log("Using random mock status check");
          return Math.random() > 0.7; 
        }
        return false;
      }
      
      const data = await fallbackResponse.json();
      console.log("Fallback connection status response:", data);
      
      return data.status === 'connected' || data.isConnected === true;
    }
  } catch (error) {
    console.error("Error checking connection status:", error);
    // Don't show toast for this error as it happens frequently in background
    return false;
  }
};
