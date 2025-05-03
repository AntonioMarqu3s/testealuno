
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan } from "@/services/plan/userPlanService";
import { getUserAgents } from "@/services/agent/agentStorageService";
import { canCreateAgent } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { checkAndSyncPlan } from "@/services/plan/planSyncService";
import { PlanType } from "@/services/plan/planTypes";
import { Agent } from "@/components/agent/AgentTypes";

export const useAgentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();
  
  // Get current user email
  const userEmail = getCurrentUserEmail();
  
  // Get user plan and check trial status
  const [userPlan, setUserPlan] = useState(getUserPlan(userEmail));
  
  // Get user agents with state management
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrAgentId, setQrAgentId] = useState<string | null>(null);
  const [canCreate, setCanCreate] = useState(false);
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
  
  // Load agents on component mount and when email changes
  useEffect(() => {
    if (userEmail) {
      setIsLoading(true);
      const agents = getUserAgents(userEmail);
      setUserAgents(agents);
      setIsLoading(false);
    }
  }, [userEmail]);
  
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
  
  // Check for URL parameter to show upgrade modal
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showUpgrade') === 'true') {
      setShowUpgradeModal(true);
    }
  }, [location]);
  
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
  
  return {
    userEmail,
    userPlan,
    userAgents,
    setUserAgents,
    isLoading,
    qrAgentId,
    showUpgradeModal,
    setShowUpgradeModal,
    canCreate,
    isRefreshing,
    handleCreateAgent,
    handleUpgradeClick,
    handleUpgradeConfirm,
    handleRefreshPlan
  };
};
