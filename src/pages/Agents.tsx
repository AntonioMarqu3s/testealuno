
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { AgentsHeader } from "@/components/agent/AgentsHeader";
import { AgentsList } from "@/components/agent/AgentsList";
import { EmptyAgentState } from "@/components/agent/EmptyAgentState";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan } from "@/services/plan/userPlanService";
import { deleteUserAgent, getUserAgents, updateUserAgent } from "@/services/agent/agentStorageService";
import { updateAgentConnectionStatus } from "@/services/agent/supabaseAgentService";
import { UpgradeModal } from "@/components/agent/UpgradeModal";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Agent } from "@/components/agent/AgentTypes";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { canCreateAgent } from "@/services/plan/planLimitService";

const Agents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast: toastHook } = useToast();
  
  // Get current user email
  const userEmail = getCurrentUserEmail();
  
  // Get user plan
  const userPlan = getUserPlan(userEmail);
  
  // Get user agents with state management
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrAgentId, setQrAgentId] = useState<string | null>(null);
  
  // Check for URL parameter to show upgrade modal
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showUpgrade') === 'true') {
      setShowUpgradeModal(true);
    }
  }, [location]);
  
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
    // Check if user can create more agents based on their plan
    const canCreate = canCreateAgent(userEmail);
    
    // If user reached their plan limit, show upgrade modal
    if (!canCreate) {
      toast.warning("Limite de plano atingido", {
        description: "Seu plano atual não permite criar mais agentes. Faça upgrade para um plano maior."
      });
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

  const handleDeleteAgent = async (agentId: string) => {
    console.log("Starting deletion process for agent:", agentId);
    try {
      const agent = userAgents.find(a => a.id === agentId);
      if (agent) {
        console.log(`Attempting to delete agent ${agent.name} with instance ${agent.instanceId}`);
      }
      
      // Delete agent from localStorage and call webhook
      const deletedSuccessfully = await deleteUserAgent(userEmail, agentId);
      
      if (deletedSuccessfully) {
        // Update local state after deletion
        setUserAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
        
        toast.success("Agente excluído", {
          description: "O agente e sua instância no WhatsApp foram removidos com sucesso.",
        });
      } else {
        throw new Error("Falha ao excluir o agente");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Erro ao excluir agente", {
        description: "Não foi possível excluir completamente o agente. Tente novamente.",
      });
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
      
      // Update local state
      setUserAgents(prevAgents => prevAgents.map(agent => 
        agent.id === agentId ? { ...agent, isConnected, connectInstancia: isConnected } : agent
      ));
      
      toast.success(isConnected ? "Agente conectado" : "Agente desconectado", {
        description: isConnected ? 
          "O agente foi conectado com sucesso." : 
          "O agente foi desconectado com sucesso.",
      });
    } catch (error) {
      toast.error("Erro de conexão", {
        description: `Não foi possível ${isConnected ? 'conectar' : 'desconectar'} o agente.`,
      });
    }
  };

  // Handle QR code display from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const showQRParam = searchParams.get('showQR');
    
    if (showQRParam) {
      setQrAgentId(showQRParam);
    } else {
      setQrAgentId(null);
    }
  }, [location.search]);

  return (
    <MainLayout title="Meus Agentes">
      <div className="space-y-6">
        <AgentsHeader 
          userPlanType={userPlan.plan} 
          onCreateAgent={handleCreateAgent} 
          onUpgradeClick={() => setShowUpgradeModal(true)}
          agentCount={userAgents.length}
        />
        
        {userAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAgents.map(agent => (
              <AgentPanel 
                key={agent.id}
                agent={agent}
                onDelete={handleDeleteAgent}
                onToggleConnection={handleToggleConnection}
                autoShowQR={agent.id === qrAgentId}
              />
            ))}
          </div>
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
