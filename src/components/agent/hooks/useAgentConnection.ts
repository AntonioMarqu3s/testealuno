
import { useState } from 'react';
import { toast } from 'sonner';

export const useAgentConnection = () => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  const handleDisconnect = async (instanceId?: string) => {
    if (!instanceId) {
      toast.error("ID da instância não encontrado");
      return false;
    }
    
    setIsDisconnecting(true);
    console.log("Disconnecting instance:", instanceId);
    
    try {
      // Updated disconnect webhook URL
      const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/desconectar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect instance');
      }
      
      const data = await response.json();
      console.log("Disconnect response:", data);
      
      toast.success("Agente desconectado com sucesso");
      setIsDisconnecting(false);
      return true;
      
    } catch (error) {
      console.error("Error disconnecting agent:", error);
      toast.error("Erro ao desconectar agente");
      setIsDisconnecting(false);
      return false;
    }
  };
  
  const checkConnectionStatus = async (instanceId?: string) => {
    if (!instanceId) return false;
    
    setIsCheckingStatus(true);
    
    try {
      console.log("Checking connection status for instance:", instanceId);
      // Updated status check webhook URL
      const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/verificar-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check connection status');
      }
      
      const data = await response.json();
      console.log("Connection status response:", data);
      
      setIsCheckingStatus(false);
      return data.status === 'connected' || data.isConnected === true;
    } catch (error) {
      console.error("Error checking connection status:", error);
      setIsCheckingStatus(false);
      return false;
    }
  };

  return {
    isDisconnecting,
    isCheckingStatus,
    handleDisconnect,
    checkConnectionStatus
  };
};
