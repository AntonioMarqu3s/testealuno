
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Agent } from "@/components/agent/AgentPanel";
import { getUserPlan, getCurrentUserEmail, generateInstanceId } from "@/services/userPlanService";
import { AgentsHeader } from "@/components/agent/AgentsHeader";
import { AgentsList } from "@/components/agent/AgentsList";
import { EmptyAgentState } from "@/components/agent/EmptyAgentState";
import { UpgradeModal } from "@/components/agent/UpgradeModal";

const Agents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get actual user email
  const userEmail = getCurrentUserEmail();
  const [userPlan, setUserPlan] = useState(() => getUserPlan(userEmail));

  useEffect(() => {
    // Check if we should show the upgrade modal from URL parameter
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showUpgrade') === 'true') {
      setShowUpgradeModal(true);
    }

    // Simulando uma chamada API para obter os agentes
    setTimeout(() => {
      // Check localStorage for user agents instead of showing dummy agents
      const storedAgents = localStorage.getItem('user_agents');
      let userAgents: Agent[] = [];
      
      if (storedAgents) {
        userAgents = JSON.parse(storedAgents);
      }
      
      // Se houver um agente na sessão, adicione-o à lista
      const newAgentData = sessionStorage.getItem('newAgent');
      if (newAgentData) {
        const newAgent = JSON.parse(newAgentData);
        const newAgentObj = {
          id: `${Date.now()}`, // Use timestamp for unique ID
          name: newAgent.agentName,
          type: newAgent.agentType,
          isConnected: false,
          createdAt: new Date(),
          instanceId: newAgent.instanceId
        };
        
        userAgents.unshift(newAgentObj);
        
        // Save updated agents list to localStorage
        localStorage.setItem('user_agents', JSON.stringify(userAgents));
        sessionStorage.removeItem('newAgent'); // Limpar após adicionar
      }
      
      // Limitar agentes conforme o plano do usuário
      const userPlan = getUserPlan(userEmail);
      let filteredAgents = userAgents;
      if (userPlan.plano === 1 && userAgents.length > 1) {
        filteredAgents = userAgents.slice(0, 1);
      }
      
      setAgents(filteredAgents);
      setUserPlan(userPlan);
      setIsLoading(false);
    }, 1000);
  }, [location.search, userEmail]);

  const handleCreateAgent = () => {
    // Verificar se o usuário pode criar mais agentes
    const userPlan = getUserPlan(userEmail);
    if (userPlan.plano === 1 && userPlan.agentCount >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    
    navigate('/dashboard?tab=agents');
  };

  const handleDeleteAgent = (agentId: string) => {
    const updatedAgents = agents.filter((agent) => agent.id !== agentId);
    setAgents(updatedAgents);
    
    // Update localStorage
    localStorage.setItem('user_agents', JSON.stringify(updatedAgents));
  };

  const handleUpgrade = () => {
    // Simula um checkout de plano premium
    console.log("Redirecionando para checkout do plano premium");
    setShowUpgradeModal(false);
    navigate('/checkout');
  };

  return (
    <MainLayout title="Meus Agentes">
      <div className="space-y-8">
        <AgentsHeader 
          userPlanType={userPlan.plano} 
          onCreateAgent={handleCreateAgent}
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />

        {!isLoading && agents.length === 0 ? (
          <EmptyAgentState onCreateAgent={handleCreateAgent} />
        ) : (
          <AgentsList 
            agents={agents} 
            onDeleteAgent={handleDeleteAgent}
            isLoading={isLoading}
          />
        )}

        <UpgradeModal 
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          onUpgrade={handleUpgrade}
        />
      </div>
    </MainLayout>
  );
};

export default Agents;
