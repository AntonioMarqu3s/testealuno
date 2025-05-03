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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Agents = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [qrAgentId, setQrAgentId] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState(false);
  
  // Check if user can create agents
  useEffect(() => {
    const checkCanCreate = async () => {
      try {
        const result = await canCreateAgent(userEmail);
        setCanCreate(result);
      } catch (error) {
        console.error("Error checking if user can create agents:", error);
      }
    };
    checkCanCreate();
  }, [userEmail]);
  
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
      setLoadError(null);
      
      try {
        const agents = getUserAgents(userEmail);
        console.log(`Loaded ${agents.length} agents for ${userEmail}`);
        setUserAgents(agents);
      } catch (error) {
        console.error("Error loading agents:", error);
        setLoadError("Não foi possível carregar os agentes. Por favor, tente novamente.");
        toast({
          variant: "destructive",
          title: "Erro ao carregar agentes",
          description: "Não foi possível carregar seus agentes. Por favor, recarregue a página.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [userEmail, toast]);
  
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
      console.error("Erro ao alterar status de conexão:", error);
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

  // Função para recarregar os agentes
  const handleReloadAgents = () => {
    // Simples reload da página para atualizar tudo
    window.location.reload();
  };

  // Renderiza a lista de agentes ou o estado vazio
  const renderAgentContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-48 w-full rounded-md" />
            </div>
          ))}
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg space-y-4">
          <div className="text-destructive text-center">
            <h3 className="text-lg font-medium">Erro ao carregar agentes</h3>
            <p className="text-muted-foreground">{loadError}</p>
          </div>
          <Button onClick={handleReloadAgents} variant="outline">
            Tentar novamente
          </Button>
        </div>
      );
    }

    if (userAgents.length === 0) {
      return <EmptyAgentState onCreateAgent={handleCreateAgent} />;
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
          />
        ))}
      </div>
    );
  };

  return (
    <MainLayout title="Meus Agentes">
      <div className="space-y-6">
        <AgentsHeader 
          userPlanType={userPlan.plan} 
          onCreateAgent={handleCreateAgent} 
          onUpgradeClick={handleUpgradeClick}
        />
        
        {renderAgentContent()}
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
