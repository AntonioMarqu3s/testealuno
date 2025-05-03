
import { useState } from "react";
import { AgentsList } from "@/components/agent/AgentsList";
import { EmptyAgentState } from "@/components/agent/EmptyAgentState";
import { updateUserAgent } from "@/services/agent/agentStorageService";
import { updateAgentConnectionStatus } from "@/services/agent/supabaseAgentService";
import { toast } from "sonner";
import { Agent } from "@/components/agent/AgentTypes";
import { AgentPanel } from "./AgentPanel"; 
import { useAgentDelete } from "@/hooks/agent/useAgentDelete";

interface AgentsPageListProps {
  userAgents: Agent[];
  isLoading: boolean;
  qrAgentId: string | null;
  userEmail: string;
  onCreateAgent: () => void;
}

export const AgentsPageList = ({
  userAgents,
  isLoading,
  qrAgentId,
  userEmail,
  onCreateAgent
}: AgentsPageListProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleDeleteAgent } = useAgentDelete();
  
  const handleAgentDelete = async (agentId: string) => {
    try {
      setIsDeleting(true);
      console.log("AgentsPageList: Starting agent deletion process for:", agentId);
      
      // Get agent details before deletion
      const agentToDelete = userAgents.find(agent => agent.id === agentId);
      
      if (!agentToDelete) {
        console.error("AgentsPageList: Agent not found for deletion:", agentId);
        toast.error("Erro", {
          description: "Agente não encontrado para exclusão.",
        });
        setIsDeleting(false);
        return false;
      }
      
      console.log("AgentsPageList: Deleting agent:", agentToDelete.name, "with instance:", agentToDelete.instanceId);
      
      // Use the agent deletion hook
      const success = await handleDeleteAgent(agentId);
      
      if (success) {
        toast.success("Agente excluído", {
          description: "O agente foi excluído permanentemente com sucesso.",
        });
        return true;
      } else {
        toast.error("Erro", {
          description: "Não foi possível excluir o agente. Tente novamente.",
        });
        return false;
      }
    } catch (error) {
      console.error("AgentsPageList: Error deleting agent:", error);
      toast.error("Erro", {
        description: "Ocorreu um erro ao excluir o agente.",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleToggleConnection = async (agentId: string, isConnected: boolean) => {
    try {
      // Update local state
      updateUserAgent(userEmail, agentId, {
        isConnected: isConnected,
        connectInstancia: isConnected
      });
      
      // Update connection status in Supabase
      await updateAgentConnectionStatus(agentId, isConnected);
      
      toast({
        title: isConnected ? "Agente conectado" : "Agente desconectado",
        description: isConnected ? 
          "O agente foi conectado com sucesso." : 
          "O agente foi desconectado com sucesso.",
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível ${isConnected ? 'conectar' : 'desconectar'} o agente.`,
      });
      
      return false;
    }
  };
  
  if (userAgents.length === 0) {
    return <EmptyAgentState onCreateAgent={onCreateAgent} />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {userAgents.map(agent => (
        <AgentPanel 
          key={agent.id}
          agent={agent}
          onDelete={handleAgentDelete}
          onToggleConnection={handleToggleConnection}
          autoShowQR={agent.id === qrAgentId}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};
