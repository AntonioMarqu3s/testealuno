
import { useState } from "react";
import { toast } from "sonner";
import { 
  getCurrentUserEmail,
  deleteUserAgent
} from "@/services";
import { deleteAgentFromSupabase } from "@/services/agent/supabase";

export const useAgentDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAgent = async (agentId: string) => {
    setIsDeleting(true);
    
    try {
      const userEmail = getCurrentUserEmail() || "user@example.com";
      console.log("Attempting to delete agent:", agentId);
      
      // Delete agent from Supabase database first
      const dbDeleted = await deleteAgentFromSupabase(agentId);
      
      if (!dbDeleted) {
        console.warn("Warning: Could not delete agent from database");
      }
      
      // Then delete agent from localStorage and call webhook
      const success = await deleteUserAgent(userEmail, agentId);
      
      if (success) {
        toast.success("Agente removido com sucesso", {
          description: "O agente e todos os seus dados foram excluídos permanentemente.",
        });
        return true;
      } else {
        toast.error("Erro ao remover agente", {
          description: "Ocorreu um erro ao remover o agente. Tente novamente.",
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Erro ao excluir agente", {
        description: "Ocorreu um erro ao excluir o agente. Por favor, tente novamente.",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDeleteAgent
  };
};
