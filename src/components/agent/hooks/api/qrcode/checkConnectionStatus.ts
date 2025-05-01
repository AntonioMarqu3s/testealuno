
import { PRIMARY_STATUS_ENDPOINT, FALLBACK_STATUS_ENDPOINT, STATUS_CHECK_TIMEOUT } from './endpoints';

/**
 * Check connection status
 * Attempts to check using primary endpoint, falls back to secondary if needed
 */
export const checkConnectionStatus = async (instanceName: string): Promise<boolean> => {
  try {
    console.log(`Checking connection status for instance: ${instanceName}`);
    
    // Try primary endpoint
    try {
      const response = await fetch(PRIMARY_STATUS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
        signal: AbortSignal.timeout(STATUS_CHECK_TIMEOUT), // 8 second timeout
      });
      
      if (!response.ok) {
        throw new Error('Failed to check connection from primary endpoint');
      }
      
      const data = await response.json();
      console.log("Connection status response from primary:", data);
      
      return data.status === 'connected' || data.isConnected === true;
    } catch (primaryError) {
      console.log("Primary status check endpoint failed, trying fallback...");
      // Try fallback endpoint
      try {
        const fallbackResponse = await fetch(FALLBACK_STATUS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instanceName }),
          signal: AbortSignal.timeout(STATUS_CHECK_TIMEOUT), // 8 second timeout
        });
        
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
        
        return data.status === 'connected' || data.isConnected === true;
      } catch (fallbackError) {
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
