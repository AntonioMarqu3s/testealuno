
import { toast } from "sonner";

// URLs para APIs de conectividade
const API_BASE_URL = "https://agente-conecta-api-prod.herokuapp.com";
const API_FALLBACK_URL = "https://agente-conecta-api-prod-2.herokuapp.com"; 

/**
 * Desconectar uma instância de agente
 */
export const disconnectInstance = async (instanceId: string): Promise<boolean> => {
  try {
    const requestData = {
      instancia: instanceId
    };
    
    // Primeiro, tente a API principal
    try {
      const primaryResponse = await fetch(`${API_BASE_URL}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (primaryResponse.ok) {
        const data = await primaryResponse.json();
        return data?.status === true;
      }
      
      console.info("Primary disconnect endpoint failed, trying fallback...");
    } catch (primaryError) {
      console.error("Primary disconnect endpoint error:", primaryError);
      console.info("Trying fallback disconnect endpoint...");
    }
    
    // Se a API principal falhar, tente a API de fallback
    const fallbackResponse = await fetch(`${API_FALLBACK_URL}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      return fallbackData?.status === true;
    }
    
    return false;
  } catch (error) {
    console.error("Error disconnecting instance:", error);
    return false;
  }
};

/**
 * Verificar o status de conexão de uma instância de agente
 */
export const checkInstanceStatus = async (instanceId: string): Promise<boolean> => {
  if (!instanceId) {
    console.error("No instance ID provided for status check");
    return false;
  }
  
  const requestData = {
    instancia: instanceId
  };
  
  // Primeiro, tente a API principal
  try {
    const primaryResponse = await fetch(`${API_BASE_URL}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      // Adicionar um timeout para evitar que espere indefinidamente
      signal: AbortSignal.timeout(5000) // 5 segundos de timeout
    });
    
    if (primaryResponse.ok) {
      const data = await primaryResponse.json();
      return data?.status === true;
    }
    
  } catch (primaryError) {
    console.error("Primary status endpoint error:", primaryError);
    console.info("Primary status endpoint failed, trying fallback...");
  }
  
  // Se a API principal falhar, tente a API de fallback
  try {
    const fallbackResponse = await fetch(`${API_FALLBACK_URL}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      // Adicionar um timeout para evitar que espere indefinidamente
      signal: AbortSignal.timeout(5000) // 5 segundos de timeout
    });
    
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      return fallbackData?.status === true;
    }
    
  } catch (fallbackError) {
    console.error("Fallback status endpoint error:", fallbackError);
  }
  
  return false;
};
