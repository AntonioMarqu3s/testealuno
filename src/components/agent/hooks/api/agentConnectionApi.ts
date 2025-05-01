
import { toast } from 'sonner';

/**
 * API functions for agent connection operations
 */

// Create agent instance
export const createAgentInstance = async (instanceId?: string, clientIdentifier?: string): Promise<boolean> => {
  if (!instanceId) {
    toast.error("ID da instância não encontrado");
    return false;
  }
  
  console.log("Creating agent instance:", instanceId, "Client ID:", clientIdentifier);
  
  try {
    // Try the primary endpoint
    try {
      const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/criar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceId,
          clientId: clientIdentifier || instanceId // Use clientIdentifier if available, fall back to instanceId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create instance');
      }
      
      const data = await response.json();
      console.log("Create instance response:", data);
      
      return true;
    } catch (primaryError) {
      console.log("Primary create instance endpoint failed, trying fallback...", primaryError);
      
      // Try fallback URL if primary fails
      const fallbackResponse = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/criar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceId,
          clientId: clientIdentifier || instanceId // Use clientIdentifier if available, fall back to instanceId
        }),
      });
      
      if (!fallbackResponse.ok) {
        throw new Error('Failed to create instance with fallback');
      }
      
      const data = await fallbackResponse.json();
      console.log("Fallback create instance response:", data);
      
      return true;
    }
  } catch (error) {
    console.error("Error creating agent instance:", error);
    toast.error("Erro ao criar instância do agente");
    return false;
  }
};

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

// Fetch QR code
export const fetchQRCode = async (instanceId?: string): Promise<string | null> => {
  if (!instanceId) {
    toast.error("ID da instância não encontrado");
    return null;
  }
  
  try {
    console.log("Fetching QR code for instance:", instanceId);
    
    // Try the primary endpoint first
    try {
      const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/gerar-qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch QR code');
      }
      
      const data = await response.json();
      console.log("QR code fetch response received", { hasQrCode: !!data.qrcode });
      
      if (data.qrcode) {
        return data.qrcode;
      }
      
      throw new Error('No QR code in response');
    } catch (primaryError) {
      console.log("Primary QR code endpoint failed, trying fallback...");
      
      // Try fallback URL if primary fails
      const fallbackResponse = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/gerar-qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!fallbackResponse.ok) {
        throw new Error('Failed to fetch QR code with fallback');
      }
      
      const data = await fallbackResponse.json();
      console.log("Fallback QR code fetch response received", { hasQrCode: !!data.qrcode });
      
      if (data.qrcode) {
        return data.qrcode;
      }
      
      throw new Error('No QR code in fallback response');
    }
  } catch (error) {
    console.error("Error fetching QR code:", error);
    toast.error("Erro ao gerar QR Code");
    
    // In development, return a placeholder image for testing
    if (process.env.NODE_ENV === 'development') {
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOdSURBVO3BQY4cOxIEwfAC//9l7x3jrYBBJNWjmRH2B2utP1hj3WCNdYM11g3WWDdYY91gjXWDNdYN1lg3WGPdYI11gzXWDdZYN1hj3WCN9YeXJPxJlW8kcJKqk4QnVZ0kfEPVScI3VJ0k/EmVb6yxbrDGusEa6wZf+LJKJ5W+odJJwkmlaYQTlU4qnVQ6SZhGOEnopNI3VPqmSt9U6ZvWWDdYY91gjXWDH/lhEk4qnSR0Ek5UTiqdJJyonFQ6SThROVF5UqWThBOVJwl/0hrrBmusG6yxbvAjf5mEE5WThBOVTsJJwknlROUk4UTlGwl/szXWDdZYN1hj3eArf7mEk4SThE6lk4SThBOVE5WThBOVTsKT1lg3WGPdYI11g6/8J1U6SThJOEk4SThJOKmYVDpRmRKeWmPdYI11gzXWDb7yn1TpJOEk4YlKJwknKicJJwmdSicJJwmdypPK32yNdYM11g3WWDf4wpclTCp9Q6WThCdVOkk4STipeKLSSUIn4YlK31TpJOEba6wbrLFusMa6wR9eSphUOkl4knCi8kSlk4QnlU4STlSeJDxR6SRhUukk4U9aY91gjXWDNdYNfuRFCZ1KJwmdSicJJwmdSicJnconCSrfUOmTEk5UOkn4xhrrBmusG6yxbvCHP0ylk4QnCSrfSOhU6iR0Ck9UThI6lScJJwknKk9aY91gjXWDNdYNfuRFCX9SpZOEJyqdJJwkPFHpJGFS6VsqnSScJExV+qY11g3WWDdYY93gCy+q9KRKJwknCScqnSR8otJJwonKpNJJwqTSScKTKn1DpZOEb6yxbrDGusEa6wY/8sNUnqh0knCi8g0JJwknCZNKJwknCU+qdJLwJOFJlX7SGusGa6wbrLFu8JW/XEKn8qRKJwlPEk5UnlQ6SThReaLSScKTKp2odJLwpDXWDdZYN1hj3eBHflilk4QTlU4SJpWeSJhUmhL+JpVOVDpJeNIa6wZrrBussbXlxUoqnSR8U8KJyknCNyV0Kp0kdAmdypOEE5Vvmk80rLFusMa6wRrrBl95UcKk0knCicqJyqTSk4QnKp0kTCqdJJyonKicJEwqnSR8otJJwjfWWDdYY91gjXWDH/mQSicJJwmdyknCpNJJwqRyktCpTCqdJEwqnSR0Kp2EE5VJ5ZPWWDdYY91gjXWDH/mXSXii0knCScKTKp0kTAmdSicJk0onCSdVOkl4knCi8qQ11g3WWDdYY93gD9Za/rDGusEa6wZrrBussbXlL22nNrxM003hAAAAAElFTkSuQmCC";
    }
    
    return null;
  }
};
