
import { useState, useRef, useCallback, useEffect } from 'react';
import { checkConnectionStatus } from '../api/qrcode/checkConnectionStatus';
import { toast } from 'sonner';

type ConnectionCallbackFunction = () => void;

export const useQRCodeConnection = () => {
  const [connectionCheckAttempts, setConnectionCheckAttempts] = useState(0);
  const connectionCheckIntervalRef = useRef<number | null>(null);
  const MAX_CONNECTION_CHECKS = 10;
  const CONNECTION_CHECK_INTERVAL = 6000;
  const connectionTimeoutRef = useRef<number | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (connectionCheckIntervalRef.current !== null) {
        window.clearInterval(connectionCheckIntervalRef.current);
      }
      if (connectionTimeoutRef.current !== null) {
        window.clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  const clearConnectionCheck = useCallback(() => {
    if (connectionCheckIntervalRef.current !== null) {
      window.clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
    
    if (connectionTimeoutRef.current !== null) {
      window.clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    setConnectionCheckAttempts(0);
  }, []);

  const startConnectionStatusCheck = useCallback((instanceId: string, onConnected: ConnectionCallbackFunction) => {
    // Clear any existing interval
    clearConnectionCheck();
    
    // Reset attempt counter
    setConnectionCheckAttempts(1);
    
    // Initial delay before first check
    connectionTimeoutRef.current = window.setTimeout(async () => {
      try {
        console.log(`Initial connection check for ${instanceId}...`);
        const isConnected = await checkConnectionStatus(instanceId);
        
        if (isConnected) {
          console.log("Connection successful on first try!");
          clearConnectionCheck();
          onConnected();
          toast.success("Agente conectado com sucesso!");
          return;
        }
        
        console.log("First connection check failed, starting interval checks...");
        
        // Start interval checks if first attempt failed
        connectionCheckIntervalRef.current = window.setInterval(async () => {
          try {
            // Only make API call if not at the limit
            if (connectionCheckAttempts >= MAX_CONNECTION_CHECKS) {
              clearConnectionCheck();
              toast.error("Não foi possível estabelecer conexão após várias tentativas.");
              return;
            }
            
            console.log(`Checking connection status (attempt ${connectionCheckAttempts + 1}/${MAX_CONNECTION_CHECKS})...`);
            const isConnected = await checkConnectionStatus(instanceId);
            
            if (isConnected) {
              console.log("Connection successful! Agent is connected.");
              clearConnectionCheck();
              onConnected();
              toast.success("Agente conectado com sucesso!");
            } else {
              setConnectionCheckAttempts(prevCount => prevCount + 1);
            }
          } catch (error) {
            console.error("Error checking connection status:", error);
            setConnectionCheckAttempts(prevCount => {
              const newCount = prevCount + 1;
              if (newCount >= MAX_CONNECTION_CHECKS) {
                clearConnectionCheck();
                toast.error("Não foi possível verificar a conexão. Tente novamente mais tarde.");
              }
              return newCount;
            });
          }
        }, CONNECTION_CHECK_INTERVAL);
      } catch (error) {
        console.error("Error on initial connection check:", error);
        setConnectionCheckAttempts(1); // Set to 1 to start the regular interval
      }
    }, 3000); // 3 second initial delay
  }, [clearConnectionCheck, connectionCheckAttempts, MAX_CONNECTION_CHECKS]);

  return {
    connectionCheckAttempts,
    connectionCheckIntervalRef,
    startConnectionStatusCheck,
    clearConnectionCheck
  };
};
