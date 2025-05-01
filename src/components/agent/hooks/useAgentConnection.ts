
import { useState } from 'react';
import { toast } from 'sonner';

export const useAgentConnection = () => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  
  const handleDisconnect = async (instanceId?: string) => {
    if (!instanceId) return false;
    
    setIsDisconnecting(true);
    
    try {
      // Call disconnect webhook
      const response = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/desconectar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect instance');
      }
      
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

  return {
    isDisconnecting,
    handleDisconnect
  };
};
