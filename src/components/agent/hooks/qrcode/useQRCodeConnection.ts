
import { useState, useRef, useCallback, useEffect } from 'react';
import { checkConnectionStatus } from '../api/qrCodeApi';
import { toast } from 'sonner';

type ConnectionCallbackFunction = () => void;

export const useQRCodeConnection = () => {
  const [connectionCheckAttempts, setConnectionCheckAttempts] = useState(0);
  const connectionCheckIntervalRef = useRef<number | null>(null);
  const MAX_CONNECTION_CHECKS = 50; // Maximum number of connection check attempts
  const CONNECTION_CHECK_INTERVAL = 6000; // Check every 6 seconds

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (connectionCheckIntervalRef.current !== null) {
        window.clearInterval(connectionCheckIntervalRef.current);
      }
    };
  }, []);

  const clearConnectionCheck = useCallback(() => {
    if (connectionCheckIntervalRef.current !== null) {
      window.clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
    setConnectionCheckAttempts(0);
  }, []);

  const startConnectionStatusCheck = useCallback((instanceId: string, onConnected: ConnectionCallbackFunction) => {
    // Clear any existing interval
    clearConnectionCheck();
    
    // Reset attempt counter
    setConnectionCheckAttempts(1);
    
    // Start checking connection status at regular intervals
    connectionCheckIntervalRef.current = window.setInterval(async () => {
      try {
        console.log(`Checking connection status (attempt ${connectionCheckAttempts + 1}/${MAX_CONNECTION_CHECKS})...`);
        
        const isConnected = await checkConnectionStatus(instanceId);
        
        if (isConnected) {
          console.log("Connection successful! Agent is connected.");
          clearConnectionCheck();
          onConnected();
        } else {
          console.log(`Connection check failed (attempt ${connectionCheckAttempts + 1}). Will retry...`);
          setConnectionCheckAttempts(prev => {
            // If we've reached the maximum number of attempts, stop checking
            if (prev >= MAX_CONNECTION_CHECKS) {
              console.log("Maximum connection check attempts reached. Stopping checks.");
              clearConnectionCheck();
              toast.error("Não foi possível estabelecer conexão após várias tentativas.");
              return prev;
            }
            return prev + 1;
          });
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
        setConnectionCheckAttempts(prev => prev + 1);
      }
    }, CONNECTION_CHECK_INTERVAL);
    
  }, [connectionCheckAttempts, clearConnectionCheck, MAX_CONNECTION_CHECKS]);

  return {
    connectionCheckAttempts,
    connectionCheckIntervalRef,
    startConnectionStatusCheck,
    clearConnectionCheck
  };
};
