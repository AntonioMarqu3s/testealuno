
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
      
      // Delete agent from localStorage and call webhook
      const success = await deleteUserAgent(userEmail, agentId);
      
      // Delete agent from Supabase database using our enhanced function
      const dbDeleted = await deleteAgentFromSupabase(agentId);
      
      if (!dbDeleted) {
        console.error("Error deleting agent from database");
        toast.error("Erro na exclusão do banco de dados", {
          description: "O agente foi removido localmente, mas ocorreu um erro ao excluí-lo do banco de dados.",
        });
      }
      
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
