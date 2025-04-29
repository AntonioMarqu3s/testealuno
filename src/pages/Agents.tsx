
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Agent } from "@/components/agent/AgentPanel";
import { 
  getUserPlan, 
  getCurrentUserEmail, 
  getUserAgents
} from "@/services";
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
    console.log("Loading agents for email:", userEmail);
    
    // Check if we should show the upgrade modal from URL parameter
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showUpgrade') === 'true') {
      setShowUpgradeModal(true);
    }

    // Load agents for the current user
    loadUserAgents();
  }, [location.search, userEmail]);

  // Function to load agents for the current user
  const loadUserAgents = () => {
    setIsLoading(true);
    
    // Get the current user's email
    const currentEmail = getCurrentUserEmail();
    console.log("Loading agents for:", currentEmail);
    
    // Simulando uma chamada API para obter os agentes
    setTimeout(() => {
      // Get agents from localStorage
      const userAgents = getUserAgents(currentEmail);
      console.log("User agents loaded:", userAgents);
      
      // Check if there's a new agent in session storage to add
      const newAgentData = sessionStorage.getItem('newAgent');
      if (newAgentData) {
        const newAgent = JSON.parse(newAgentData);
        console.log("New agent found in session:", newAgent);
        
        // Create agent object
        const newAgentObj = {
          id: `${Date.now()}`,
          name: newAgent.agentName,
          type: newAgent.agentType,
          isConnected: false,
          createdAt: new Date(),
          instanceId: newAgent.instanceId
        };
        
        // Add to beginning of agents list
        setAgents([newAgentObj, ...userAgents]);
        
        // Clear session storage
        sessionStorage.removeItem('newAgent');
      } else {
        // Just use the loaded agents
        setAgents(userAgents);
      }
      
      // Update user plan state
      setUserPlan(getUserPlan(currentEmail));
      setIsLoading(false);
    }, 1000);
  };

  const handleCreateAgent = () => {
    // Verificar se o usuário pode criar mais agentes
    const currentEmail = getCurrentUserEmail();
    const userPlan = getUserPlan(currentEmail);
    
    if (userPlan.plan === 1 && agents.length >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    
    navigate('/dashboard?tab=agents');
  };

  const handleDeleteAgent = (agentId: string) => {
    const currentEmail = getCurrentUserEmail();
    
    // Filter out deleted agent
    const updatedAgents = agents.filter((agent) => agent.id !== agentId);
    setAgents(updatedAgents);
    
    // Update local storage
    const allAgentsData = localStorage.getItem('all_agents');
    if (allAgentsData) {
      const allAgents: Record<string, Agent[]> = JSON.parse(allAgentsData);
      allAgents[currentEmail] = updatedAgents;
      localStorage.setItem('all_agents', JSON.stringify(allAgents));
    }
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
          userPlanType={userPlan.plan} 
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
