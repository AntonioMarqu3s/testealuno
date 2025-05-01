
/**
 * API functions for connecting agents
 */
import { PRIMARY_CREATE_INSTANCE_ENDPOINT, FALLBACK_CREATE_INSTANCE_ENDPOINT, QR_CODE_REQUEST_TIMEOUT } from './qrcode/endpoints';

/**
 * Create agent instance on the backend
 */
export const createAgentInstance = async (instanceName: string, clientIdentifier?: string): Promise<boolean> => {
  try {
    console.log(`Creating agent instance: ${instanceName}, Client ID: ${clientIdentifier || 'none'}`);
    
    // Try primary endpoint
    try {
      const response = await fetch(PRIMARY_CREATE_INSTANCE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName,
          clientIdentifier
        }),
        signal: AbortSignal.timeout(QR_CODE_REQUEST_TIMEOUT),
      });
      
      if (!response.ok) {
        console.error("Primary endpoint error status:", response.status);
        throw new Error(`Failed to create agent instance from primary endpoint: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Instance created successfully:", data);
      return true;
      
    } catch (primaryError) {
      console.error("Primary endpoint error:", primaryError);
      
      // Try fallback endpoint
      console.log("Primary endpoint failed, trying fallback...");
      try {
        const fallbackResponse = await fetch(FALLBACK_CREATE_INSTANCE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            instanceName,
            clientIdentifier
          }),
          signal: AbortSignal.timeout(QR_CODE_REQUEST_TIMEOUT),
        });
        
        if (!fallbackResponse.ok) {
          console.error("Fallback endpoint error status:", fallbackResponse.status);
          throw new Error(`Failed to create agent instance from fallback endpoint: ${fallbackResponse.status}`);
        }
        
        const data = await fallbackResponse.json();
        console.log("Instance created successfully with fallback:", data);
        return true;
      } catch (fallbackError) {
        console.error("Fallback endpoint error:", fallbackError);
        return false;
      }
    }
  } catch (error) {
    console.error("Error creating agent instance:", error);
    return false;
  }
};
