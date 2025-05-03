
import { useState } from "react";
import { toast } from "sonner";
import { disconnectInstance } from "@/components/agent/hooks/api/agentConnectionApi";
import { checkConnectionStatus } from "@/components/agent/hooks/api/qrCodeApi";

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

  const checkAgentConnectionStatus = async (instanceId: string, agentId: string) => {
    if (!instanceId) {
      console.error("No instance ID provided for connection check");
      return false;
    }

    try {
      setIsCheckingStatus(true);
      console.log("Checking connection status for:", instanceId);
      
      // Check if instance is connected
      const isConnected = await checkConnectionStatus(instanceId);
      console.log("Connection status for", instanceId, ":", isConnected);
      
      return isConnected;
    } catch (error) {
      console.error("Error checking connection status:", error);
      return false;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return {
    isDisconnecting,
    isCheckingStatus,
    handleDisconnect,
    checkConnectionStatus: checkAgentConnectionStatus
  };
};
