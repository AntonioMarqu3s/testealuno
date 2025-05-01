
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { AgentsHeader } from "@/components/agent/AgentsHeader";
import { AgentsList } from "@/components/agent/AgentsList";
import { EmptyAgentState } from "@/components/agent/EmptyAgentState";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan, hasTrialExpired } from "@/services/plan/userPlanService";
import { deleteUserAgent, getUserAgents, updateUserAgent } from "@/services/agent/agentStorageService";
import { UpgradeModal } from "@/components/agent/UpgradeModal";
import { useToast } from "@/hooks/use-toast";
import { Agent } from "@/components/agent/AgentTypes";

const Agents = () => {
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();
  
  // Get current user email
  const userEmail = getCurrentUserEmail();
  
  // Get user plan and check trial status
  const userPlan = getUserPlan(userEmail);
  const isTrialExpired = hasTrialExpired(userEmail);
  
  // Get user agents with state management
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for URL parameter to show upgrade modal
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showUpgrade') === 'true') {
      setShowUpgradeModal(true);
    }
  }, []);
  
  // Load agents on component mount and when email changes
  useEffect(() => {
    if (userEmail) {
      setIsLoading(true);
      const agents = getUserAgents(userEmail);
      setUserAgents(agents);
      setIsLoading(false);
    }
  }, [userEmail]);
  
  const handleCreateAgent = () => {
    // If trial expired, show upgrade modal
    if (isTrialExpired) {
      setShowUpgradeModal(true);
    } else {
      navigate('/create-agent'); // Navigate to create agent page directly
    }
  };
  
  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };
  
  const handleUpgradeConfirm = () => {
    setShowUpgradeModal(false);
    navigate('/plan-checkout');
  };

  const handleDeleteAgent = (agentId: string) => {
    try {
      deleteUserAgent(userEmail, agentId);
      // Update local state after deletion
      setUserAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
      toast({
        title: "Agente excluído",
        description: "O agente foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o agente.",
      });
    }
  };
  
  const handleToggleConnection = (agentId: string, isConnected: boolean) => {
    try {
      // Update agent connection status
      updateUserAgent(userEmail, agentId, {
        isConnected: isConnected
      });
      
      // Update local state
      setUserAgents(prevAgents => prevAgents.map(agent => 
        agent.id === agentId ? { ...agent, isConnected } : agent
      ));
      
      toast({
        title: isConnected ? "Agente conectado" : "Agente desconectado",
        description: isConnected ? 
          "O agente foi conectado com sucesso." : 
          "O agente foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível ${isConnected ? 'conectar' : 'desconectar'} o agente.`,
      });
    }
  };

  return (
    <MainLayout title="Meus Agentes">
      <div className="space-y-6">
        <AgentsHeader 
          userPlanType={userPlan.plan} 
          onCreateAgent={handleCreateAgent} 
          onUpgradeClick={handleUpgradeClick}
        />
        
        {userAgents.length > 0 ? (
          <AgentsList 
            agents={userAgents} 
            onDeleteAgent={handleDeleteAgent}
            onToggleConnection={handleToggleConnection}
            isLoading={isLoading}
          />
        ) : (
          <EmptyAgentState onCreateAgent={handleCreateAgent} />
        )}
      </div>
      
      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
        onConfirm={handleUpgradeConfirm}
      />
    </MainLayout>
  );
};

export default Agents;
