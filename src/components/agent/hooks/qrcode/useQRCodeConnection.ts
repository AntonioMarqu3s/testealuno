
import { useState, useRef } from 'react';
import { checkConnectionStatus } from '../api/qrCodeApi';

export const useQRCodeConnection = () => {
  const [connectionCheckAttempts, setConnectionCheckAttempts] = useState(0);
  const connectionCheckIntervalRef = useRef<number | null>(null);
  
  const clearConnectionCheck = () => {
    if (connectionCheckIntervalRef.current !== null) {
      window.clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
    setConnectionCheckAttempts(0);
  };
  
  const startConnectionStatusCheck = (instanceName: string, onConnected: () => void) => {
    // Clear any existing interval
    clearConnectionCheck();
    
    // Start checking connection status every 5 seconds
    const intervalId = window.setInterval(async () => {
      try {
        console.log("Checking connection status for:", instanceName);
        
        const isConnected = await checkConnectionStatus(instanceName);
        
        // If connected, trigger the onConnected callback
        if (isConnected) {
          console.log("Connection successful!");
          
          // Clear connection check interval
          clearConnectionCheck();
          
          // Call connected callback
          onConnected();
        } else {
          // Increment connection check attempts
          setConnectionCheckAttempts(prev => prev + 1);
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
        setConnectionCheckAttempts(prev => prev + 1);
      }
    }, 5000); // Check every 5 seconds
    
    connectionCheckIntervalRef.current = intervalId;
  };

  return {
    connectionCheckAttempts,
    connectionCheckIntervalRef,
    startConnectionStatusCheck,
    clearConnectionCheck
  };
};
