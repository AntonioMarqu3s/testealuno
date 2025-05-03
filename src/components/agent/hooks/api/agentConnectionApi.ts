
/**
 * API functions for connecting agents
 */
import { PRIMARY_CREATE_INSTANCE_ENDPOINT, FALLBACK_CREATE_INSTANCE_ENDPOINT, QR_CODE_REQUEST_TIMEOUT, PRIMARY_STATUS_ENDPOINT, FALLBACK_STATUS_ENDPOINT, STATUS_CHECK_TIMEOUT } from './qrcode/endpoints';

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

/**
 * Check status of an agent instance
 */
export const checkInstanceStatus = async (instanceName: string): Promise<{ connected: boolean; qrCode?: string }> => {
  try {
    console.log(`Checking status for instance: ${instanceName}`);
    
    // Try primary status endpoint
    try {
      const response = await fetch(PRIMARY_STATUS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
        signal: AbortSignal.timeout(STATUS_CHECK_TIMEOUT),
      });
      
      if (!response.ok) {
        console.error("Primary status endpoint error:", response.status);
        throw new Error(`Failed to check status from primary endpoint: ${response.status}`);
      }
      
      const data = await response.json();
      return { 
        connected: data.connected || data.status === 'connected' || false,
        qrCode: data.qrCode || data.qr || undefined
      };
      
    } catch (primaryError) {
      console.error("Primary status endpoint error:", primaryError);
      
      // Try fallback status endpoint
      console.log("Primary status endpoint failed, trying fallback...");
      try {
        const fallbackResponse = await fetch(FALLBACK_STATUS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instanceName }),
          signal: AbortSignal.timeout(STATUS_CHECK_TIMEOUT),
        });
        
        if (!fallbackResponse.ok) {
          console.error("Fallback status endpoint error:", fallbackResponse.status);
          throw new Error(`Failed to check status from fallback endpoint: ${fallbackResponse.status}`);
        }
        
        const data = await fallbackResponse.json();
        return { 
          connected: data.connected || data.status === 'connected' || false,
          qrCode: data.qrCode || data.qr || undefined
        };
      } catch (fallbackError) {
        console.error("Fallback status endpoint error:", fallbackError);
        return { connected: false };
      }
    }
  } catch (error) {
    console.error("Error checking instance status:", error);
    return { connected: false };
  }
};

/**
 * Disconnect an agent instance
 * This function is used to disconnect an agent instance on the server
 */
export const disconnectInstance = async (instanceName: string): Promise<boolean> => {
  console.log(`Disconnecting instance: ${instanceName}`);
  // In a real implementation, this would make an API call to disconnect the instance
  // For now we'll return true to simulate successful disconnection
  return true;
};

// Adding this alias for backward compatibility
export const deleteInstance = disconnectInstance;
