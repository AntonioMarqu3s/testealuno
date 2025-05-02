
import { useState } from "react";
import { toast } from "sonner";
import { updatePlanConnectionStatus } from "@/services/plan/supabase/planUpdateService";

export function useConnectionToggle(initialValue: boolean = false) {
  const [connectInstancia, setConnectInstancia] = useState(initialValue);
  const [isUpdatingConnection, setIsUpdatingConnection] = useState(false);

  const handleConnectionToggle = async (userId: string | undefined) => {
    if (!userId) {
      toast.error("Você precisa estar logado para alterar essa configuração");
      return;
    }

    setIsUpdatingConnection(true);
    try {
      const success = await updatePlanConnectionStatus(userId, !connectInstancia);
      if (success) {
        setConnectInstancia(!connectInstancia);
        toast.success(
          !connectInstancia 
            ? "Conexão automática ativada" 
            : "Conexão automática desativada"
        );
      } else {
        toast.error("Erro ao atualizar a configuração");
      }
    } catch (error) {
      console.error("Error updating connection status:", error);
      toast.error("Erro ao atualizar a configuração");
    } finally {
      setIsUpdatingConnection(false);
    }
  };

  return {
    connectInstancia, 
    setConnectInstancia,
    isUpdatingConnection,
    handleConnectionToggle
  };
}
