import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

type ConnectionCallbackFunction = () => void;

export const useQRCodeConnection = () => {
  const [connectionCheckAttempts, setConnectionCheckAttempts] = useState(0);
  const connectionCheckIntervalRef = useRef<number | null>(null);
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
    // Interface mantida, mas não realiza mais simulação automática
    console.log("Connection status checks disabled to prevent loops");
    setConnectionCheckAttempts(1);
    // Não fecha o modal automaticamente. Só fecha por ação do usuário ou conexão real.
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
