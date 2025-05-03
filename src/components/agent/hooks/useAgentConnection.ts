
import { useState } from "react";
import { toast } from "sonner";
import { disconnectInstance } from "@/components/agent/hooks/api/agentConnectionApi";

export const useAgentConnection = () => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const handleDisconnect = async (instanceId: string, agentId: string) => {
    if (!instanceId) {
      toast.error("ID da instância não encontrado");
      return false;
    }

    try {
      setIsDisconnecting(true);
      console.log("Disconnecting agent:", instanceId);
      
      // Call API to disconnect instance
      await disconnectInstance(instanceId);
      
      toast.success("Agente desconectado com sucesso");
      return true;
    } catch (error) {
      console.error("Failed to disconnect agent:", error);
      toast.error("Erro ao desconectar agente");
      return false;
    } finally {
      setIsDisconnecting(false);
    }
  };

  // We've removed the checkAgentConnectionStatus function that was causing the loop

  return {
    isDisconnecting,
    isCheckingStatus,
    handleDisconnect
  };
};
