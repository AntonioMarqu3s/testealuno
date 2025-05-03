import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { AgentsHeader } from "@/components/agent/AgentsHeader";
import { AgentsList } from "@/components/agent/AgentsList";
import { EmptyAgentState } from "@/components/agent/EmptyAgentState";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan, hasTrialExpired, PlanType } from "@/services/plan/userPlanService";
import { deleteUserAgent, getUserAgents, updateUserAgent } from "@/services/agent/agentStorageService";
import { updateAgentConnectionStatus } from "@/services/agent/supabaseAgentService";
import { UpgradeModal } from "@/components/agent/UpgradeModal";
import { useToast } from "@/hooks/use-toast";
import { Agent } from "@/components/agent/AgentTypes";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { canCreateAgent } from "@/services";
import { Button } from "@/components/ui/button";
import { checkAndSyncPlan } from "@/services/plan/planSyncService";

const Agents = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();
  
  // Get current user email
  const userEmail = getCurrentUserEmail();
  
  // Get user plan and check trial status
  const [userPlan, setUserPlan] = useState(getUserPlan(userEmail));
  const [isTrialExpired, setIsTrialExpired] = useState(hasTrialExpired(userEmail));
  
  // Get user agents with state management
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrAgentId, setQrAgentId] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check for payment confirmation and sync plan on load
  useEffect(() => {
    const initPlanCheck = async () => {
      setIsRefreshing(true);
      await checkAndSyncPlan(location, userEmail);
      // Recarregar plano após a sincronização
      setUserPlan(getUserPlan(userEmail));
      setIsRefreshing(false);
    };

    initPlanCheck();
  }, [location, userEmail]);
  
  // Check if user can create agents
  useEffect(() => {
    const checkCanCreate = async () => {
      const result = await canCreateAgent(userEmail);
      setCanCreate(result);
    };
    checkCanCreate();
  }, [userEmail, userPlan]);
  
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
  
  const handleCreateAgent = async () => {
    // Verify again if user can create more agents
    const canCreateMore = await canCreateAgent(userEmail);
    
    if (!canCreateMore) {
      if (userPlan.plan === PlanType.FREE_TRIAL) {
        toast({
          title: "Limite do plano gratuito atingido",
          description: "Seu plano gratuito não permite a criação de mais agentes. Por favor, faça upgrade para um plano pago.",
          variant: "destructive"
        });
        setShowUpgradeModal(true);
      } else {
        toast({
          title: "Limite de agentes atingido",
          description: `Seu plano ${userPlan.name} permite até ${userPlan.agentLimit} agentes. Por favor, faça upgrade para um plano superior.`,
          variant: "destructive"
        });
        setShowUpgradeModal(true);
      }
    } else {
      navigate('/create-agent');
    }
  };
  
  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };
  
  const handleUpgradeConfirm = () => {
    setShowUpgradeModal(false);
    navigate('/plans');
  };

  // Função para forçar a atualização do plano e recarregar a página
  const handleRefreshPlan = async () => {
    setIsRefreshing(true);
    await checkAndSyncPlan(location, userEmail);
    // Recarregar plano após a sincronização
    setUserPlan(getUserPlan(userEmail));
    setIsRefreshing(false);
    toast({
      title: "Plano sincronizado",
      description: `Seu plano atual é: ${userPlan.name}`,
    });
  };

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
        return;
      }
      
      console.log("Deleting agent:", agentToDelete.name, "with instance:", agentToDelete.instanceId);
      
      // Delete agent from localStorage and call webhook API
      const success = await deleteUserAgent(userEmail, agentId);
      
      if (success) {
        // Update local state after deletion
        setUserAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
        
        toast({
          title: "Agente excluído",
          description: "O agente foi excluído permanentemente com sucesso.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível excluir o agente. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao excluir o agente.",
      });
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
      
      // Update local state
      setUserAgents(prevAgents => prevAgents.map(agent => 
        agent.id === agentId ? { ...agent, isConnected, connectInstancia: isConnected } : agent
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

  // Handle QR code display from URL parameter - only show if from create-agent flow
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const showQRParam = searchParams.get('showQR');
    const fromCreate = searchParams.get('fromCreate');
    
    if (showQRParam && fromCreate === 'true') {
      setQrAgentId(showQRParam);
    } else {
      setQrAgentId(null);
    }
  }, [location.search]);

  return (
    <MainLayout title="Meus Agentes">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <AgentsHeader 
            userPlanType={userPlan.plan} 
            onCreateAgent={handleCreateAgent} 
            onUpgradeClick={handleUpgradeClick}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshPlan} 
            disabled={isRefreshing}
          >
            {isRefreshing ? "Atualizando..." : "Atualizar Plano"}
          </Button>
        </div>
        
        {userAgents.length > 0 ? (
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
