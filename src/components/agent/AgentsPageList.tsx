
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentsList } from "@/components/agent/AgentsList";
import { EmptyAgentState } from "@/components/agent/EmptyAgentState";
import { deleteUserAgent, updateUserAgent } from "@/services/agent/agentStorageService";
import { updateAgentConnectionStatus } from "@/services/agent/supabaseAgentService";
import { useToast } from "@/hooks/use-toast";
import { Agent } from "@/components/agent/AgentTypes";

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
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteAgent = async (agentId: string) => {
    try {
      setIsDeleting(true);
      console.log("Starting agent deletion process:", agentId);
      
      // Get agent details before deletion
      const agentToDelete = userAgents.find(agent => agent.id === agentId);
      
      if (!agentToDelete) {
        console.error("Agent not found for deletion:", agentId);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Agente não encontrado para exclusão.",
        });
        setIsDeleting(false);
        return false;
      }
      
      console.log("Deleting agent:", agentToDelete.name, "with instance:", agentToDelete.instanceId);
      
      // Delete agent from localStorage and call webhook API
      const success = await deleteUserAgent(userEmail, agentId);
      
      if (success) {
        toast({
          title: "Agente excluído",
          description: "O agente foi excluído permanentemente com sucesso.",
        });
        
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível excluir o agente. Tente novamente.",
        });
        
        return false;
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao excluir o agente.",
      });
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleToggleConnection = async (agentId: string, isConnected: boolean) => {
    try {
      // Update agent connection status in localStorage
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
          onDelete={handleDeleteAgent}
          onToggleConnection={handleToggleConnection}
          autoShowQR={agent.id === qrAgentId}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};

// Import AgentPanel to avoid circular dependency
import { AgentPanel } from "./AgentPanel";
