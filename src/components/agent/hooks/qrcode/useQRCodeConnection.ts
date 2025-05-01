
import { useState, useRef, useCallback, useEffect } from 'react';
import { checkConnectionStatus } from '../api/qrCodeApi';
import { toast } from 'sonner';

type ConnectionCallbackFunction = () => void;

export const useQRCodeConnection = () => {
  const [connectionCheckAttempts, setConnectionCheckAttempts] = useState(0);
  const connectionCheckIntervalRef = useRef<number | null>(null);
  const MAX_CONNECTION_CHECKS = 20; // Reduced from 50 to 20
  const CONNECTION_CHECK_INTERVAL = 8000; // Increased from 6s to 8s to reduce request frequency

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
          toast.success("Agente conectado com sucesso!");
        } else {
          setConnectionCheckAttempts(prev => {
            const newCount = prev + 1;
            console.log(`Connection check failed (attempt ${newCount}). Will retry...`);
            
            // If we've reached the maximum number of attempts, stop checking
            if (newCount >= MAX_CONNECTION_CHECKS) {
              console.log("Maximum connection check attempts reached. Stopping checks.");
              clearConnectionCheck();
              toast.error("Não foi possível estabelecer conexão após várias tentativas.");
            }
            return newCount;
          });
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
        setConnectionCheckAttempts(prev => {
          const newCount = prev + 1;
          if (newCount >= MAX_CONNECTION_CHECKS) {
            clearConnectionCheck();
            toast.error("Não foi possível verificar a conexão. Tente novamente mais tarde.");
          }
          return newCount;
        });
      }
    }, CONNECTION_CHECK_INTERVAL);
    
  }, [clearConnectionCheck, MAX_CONNECTION_CHECKS]);

  return {
    connectionCheckAttempts,
    connectionCheckIntervalRef,
    startConnectionStatusCheck,
    clearConnectionCheck
  };
};
