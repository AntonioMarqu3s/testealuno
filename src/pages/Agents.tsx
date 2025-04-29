
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

    // Get the current email when loading agents
    const currentEmail = getCurrentUserEmail();
    
    // Load agents for the current user
    loadUserAgents(currentEmail);
  }, [location.search]);

  // Function to load agents for a specific user
  const loadUserAgents = (email: string) => {
    setIsLoading(true);
    
    // Simulando uma chamada API para obter os agentes
    setTimeout(() => {
      // Check localStorage for all agents
      const allAgentsData = localStorage.getItem('all_agents');
      let allAgents: Record<string, Agent[]> = allAgentsData ? JSON.parse(allAgentsData) : {};
      
      // Get agents for current email or initialize empty array
      let userAgents = allAgents[email] || [];
      
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
          instanceId: newAgent.instanceId || generateInstanceId(email, newAgent.agentName)
        };
        
        userAgents.unshift(newAgentObj);
        
        // Save updated agents list to localStorage
        allAgents[email] = userAgents;
        localStorage.setItem('all_agents', JSON.stringify(allAgents));
        sessionStorage.removeItem('newAgent'); // Limpar após adicionar
      }
      
      // Limitar agentes conforme o plano do usuário
      const userPlan = getUserPlan(email);
      let filteredAgents = userAgents;
      if (userPlan.plano === 1 && userAgents.length > 1) {
        filteredAgents = userAgents.slice(0, 1);
      }
      
      setAgents(filteredAgents);
      setUserPlan(userPlan);
      setIsLoading(false);
    }, 1000);
  };

  const handleCreateAgent = () => {
    // Verificar se o usuário pode criar mais agentes
    const currentEmail = getCurrentUserEmail();
    const userPlan = getUserPlan(currentEmail);
    if (userPlan.plano === 1 && userPlan.agentCount >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    
    navigate('/dashboard?tab=agents');
  };

  const handleDeleteAgent = (agentId: string) => {
    const currentEmail = getCurrentUserEmail();
    const updatedAgents = agents.filter((agent) => agent.id !== agentId);
    setAgents(updatedAgents);
    
    // Update localStorage with email-specific agents
    const allAgentsData = localStorage.getItem('all_agents');
    let allAgents: Record<string, Agent[]> = allAgentsData ? JSON.parse(allAgentsData) : {};
    allAgents[currentEmail] = updatedAgents;
    localStorage.setItem('all_agents', JSON.stringify(allAgents));
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
