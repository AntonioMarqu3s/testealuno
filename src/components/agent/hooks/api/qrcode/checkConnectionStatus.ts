
import { PRIMARY_STATUS_ENDPOINT, FALLBACK_STATUS_ENDPOINT, STATUS_CHECK_TIMEOUT } from './endpoints';

/**
 * Check connection status
 * Attempts to check using primary endpoint, falls back to secondary if needed
 */
export const checkConnectionStatus = async (instanceName: string): Promise<boolean> => {
  try {
    console.log(`Checking connection status for instance: ${instanceName}`);
    
    // Use a single shared controller for both requests to ensure proper cancellation
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, STATUS_CHECK_TIMEOUT);
    
    try {
      // Try primary endpoint
      const response = await fetch(PRIMARY_STATUS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
        signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to check connection from primary endpoint');
      }
      
      const data = await response.json();
      console.log("Connection status response from primary:", data);
      
      // Check for connected status in multiple possible response formats
      if (data.status === 'connected' || 
          data.isConnected === true || 
          (data.connected === true) || 
          (data.data && data.data.connected === true)) {
        return true;
      }
      
      return false;
    } catch (primaryError) {
      console.log("Primary status check endpoint failed, trying fallback...");
      clearTimeout(timeoutId);
      
      // Set new timeout for fallback request
      const fallbackTimeoutId = setTimeout(() => {
        controller.abort();
      }, STATUS_CHECK_TIMEOUT);
      
      try {
        const fallbackResponse = await fetch(FALLBACK_STATUS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instanceName }),
          signal: controller.signal,
        });
        
        clearTimeout(fallbackTimeoutId);
        
        if (!fallbackResponse.ok) {
          // For development, return random status
          if (process.env.NODE_ENV === 'development') {
            const isConnected = Math.random() > 0.7;
            console.log("Using mock connection check:", isConnected);
            return isConnected;
          }
          throw new Error('Failed to check connection from both endpoints');
        }
        
        const data = await fallbackResponse.json();
        console.log("Connection status response from fallback:", data);
        
        // Check for connected status in multiple possible response formats
        if (data.status === 'connected' || 
            data.isConnected === true || 
            (data.connected === true) || 
            (data.data && data.data.connected === true)) {
          return true;
        }
        
        return false;
      } catch (fallbackError) {
        clearTimeout(fallbackTimeoutId);
        console.error("Fallback status check failed:", fallbackError);
        
        // For development, provide a fallback
        if (process.env.NODE_ENV === 'development') {
          return Math.random() > 0.7;
        }
      }
    }
  } catch (error) {
    console.error("Error checking connection status:", error);
  }
  
  // Default to false for production or if all attempts fail
  return false;
};
