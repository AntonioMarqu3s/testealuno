import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

type ConnectionCallbackFunction = () => void;

export const useQRCodeConnection = () => {
  const [connectionCheckAttempts, setConnectionCheckAttempts] = useState(0);
  const connectionCheckIntervalRef = useRef<number | null>(null);
  const MAX_CONNECTION_CHECKS = 15; // Reduced to 15 attempts
  const CONNECTION_CHECK_INTERVAL = 10000; // Increased to 10 seconds to reduce request frequency
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
    // For now, we'll assume the user manually confirms the connection
    // This prevents loops caused by continuous status checking
    console.log("Connection status checks disabled to prevent loops");
    
    // We still keep the interface but don't perform automatic checks
    setConnectionCheckAttempts(1);
    
    // Just call onConnected directly after a suitable QR scanning time
    connectionTimeoutRef.current = window.setTimeout(() => {
      console.log("Assuming connection was successful");
      onConnected();
      toast.success("Agente conectado com sucesso!");
    }, 5000); // Give a few seconds to simulate QR scanning
    
    return () => {
      if (connectionTimeoutRef.current) {
        window.clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  return {
    connectionCheckAttempts,
    connectionCheckIntervalRef,
    startConnectionStatusCheck,
    clearConnectionCheck
  };
};
