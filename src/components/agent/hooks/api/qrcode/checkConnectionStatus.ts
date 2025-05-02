
import { STATUS_CHECK_TIMEOUT } from './endpoints';

/**
 * Check connection status
 * Uses the specified Evolution API endpoint to check connection state
 */
export const checkConnectionStatus = async (instanceName: string): Promise<boolean> => {
  try {
    console.log(`Checking connection status for instance: ${instanceName}`);
    
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, STATUS_CHECK_TIMEOUT);
    
    try {
      // Use the Evolution API endpoint
      const response = await fetch(`https://n8n-evolution-api.31kvca.easypanel.host/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Failed to check connection: ${response.status}`);
        return false;
      }
      
      const data = await response.json();
      console.log("Connection status response:", data);
      
      // Check for connected status
      if (data && typeof data.state === 'string') {
        return data.state.toLowerCase() === 'open';
      }
      
      return false;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Status check failed:", error);
      
      // For development only
      if (process.env.NODE_ENV === 'development') {
        return Math.random() > 0.5;
      }
      return false;
    }
  } catch (error) {
    console.error("Error checking connection status:", error);
    return false;
  }
};
