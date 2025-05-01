
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { AgentsHeader } from "@/components/agent/AgentsHeader";
import { AgentsList } from "@/components/agent/AgentsList";
import { EmptyAgentState } from "@/components/agent/EmptyAgentState";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan } from "@/services/plan/userPlanService";
import { deleteAgent, getUserAgents } from "@/services/agent/agentStorageService";
import { UpgradeModal } from "@/components/agent/UpgradeModal";
import { useToast } from "@/hooks/use-toast";

const Agents = () => {
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();
  
  // Get current user email
  const userEmail = getCurrentUserEmail();
  
  // Get user plan
  const userPlan = getUserPlan(userEmail);
  
  // Get user agents
  const userAgents = getUserAgents(userEmail);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCreateAgent = () => {
    navigate('/dashboard'); // Navigate to dashboard to select agent type
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
      deleteAgent(userEmail, agentId);
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
