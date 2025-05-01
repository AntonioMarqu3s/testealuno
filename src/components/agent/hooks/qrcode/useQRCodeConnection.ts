
import { useState, useRef, useCallback } from 'react';
import { checkConnectionStatus } from '../api/qrCodeApi';
import { toast } from 'sonner';

export const useQRCodeConnection = () => {
  const [connectionCheckAttempts, setConnectionCheckAttempts] = useState(0);
  const connectionCheckIntervalRef = useRef<number | null>(null);
  const MAX_ATTEMPTS = 20; // Maximum number of attempts (5 minutes at 15-second intervals)
  
  const clearConnectionCheck = useCallback(() => {
    if (connectionCheckIntervalRef.current !== null) {
      window.clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
    setConnectionCheckAttempts(0);
  }, []);
  
  const startConnectionStatusCheck = useCallback((instanceName: string, onConnected: () => void) => {
    // Clear any existing interval
    clearConnectionCheck();
    
    console.log("Starting connection status check for:", instanceName);
    
    // Start checking connection status every 15 seconds
    const intervalId = window.setInterval(async () => {
      try {
        // Increment connection check attempts first so UI shows correct attempt number
        setConnectionCheckAttempts(prev => {
          const newAttempt = prev + 1;
          console.log("Checking connection status for:", instanceName, "- Attempt:", newAttempt);
          
          // Check if we've exceeded max attempts
          if (newAttempt >= MAX_ATTEMPTS) {
            clearConnectionCheck();
            toast.error("Tempo limite de conexão excedido. Por favor, tente novamente.");
            return 0; // Reset attempts
          }
          
          return newAttempt;
        });
        
        const isConnected = await checkConnectionStatus(instanceName);
        
        // If connected, trigger the onConnected callback
        if (isConnected) {
          console.log("Connection successful!");
          
          // Clear connection check interval
          clearConnectionCheck();
          
          // Call connected callback
          onConnected();
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
      }
    }, 15000); // Check every 15 seconds instead of 5 seconds to reduce API calls
    
    connectionCheckIntervalRef.current = intervalId;
  }, [clearConnectionCheck, MAX_ATTEMPTS]);

  return {
    connectionCheckAttempts,
    connectionCheckIntervalRef,
    startConnectionStatusCheck,
    clearConnectionCheck
  };
};
