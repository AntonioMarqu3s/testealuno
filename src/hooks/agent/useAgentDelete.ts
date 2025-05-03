
import { useState } from "react";
import { toast } from "sonner";
import { 
  getCurrentUserEmail,
  deleteUserAgent
} from "@/services";
import { deleteAgentFromSupabase } from "@/services/agent/supabaseAgentService";

export const useAgentDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAgent = async (agentId: string) => {
    setIsDeleting(true);
    
    try {
      const userEmail = getCurrentUserEmail() || "user@example.com";
      console.log("Starting agent deletion process for agent:", agentId);
      
      // First delete from Supabase
      console.log("Deleting agent from Supabase database first");
      const dbDeleted = await deleteAgentFromSupabase(agentId);
      
      if (!dbDeleted) {
        console.warn("Warning: Could not delete agent from Supabase database");
      } else {
        console.log("Successfully deleted agent from Supabase database");
      }
      
      // Then delete from localStorage
      console.log("Now deleting agent from local storage");
      const localDeleted = await deleteUserAgent(userEmail, agentId);
      
      if (localDeleted) {
        toast.success("Agente removido com sucesso", {
          description: "O agente e todos os seus dados foram excluídos permanentemente.",
        });
        console.log("Agent deletion completed successfully");
        return true;
      } else {
        toast.error("Erro ao remover agente", {
          description: "Ocorreu um erro ao remover o agente. Tente novamente.",
        });
        console.error("Failed to delete agent from local storage");
        return false;
      }
    } catch (error) {
      console.error("Error during agent deletion:", error);
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
