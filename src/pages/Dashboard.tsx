
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { getCurrentUserEmail } from "@/services/user/userService";
import { 
  getUserPlan, 
  PlanType,
  getTrialDaysRemaining, 
  hasTrialExpired,
  hasSubscriptionExpired
} from "@/services/plan/userPlanService";
import { getUserAgents } from "@/services/agent/agentStorageService";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { AgentTypeTabs } from "@/components/dashboard/AgentTypeTabs";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useState } from "react";
import { canCreateAgent } from "@/services/plan/planLimitService";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'discover'; // Default to discover tab
  const [isChecking, setIsChecking] = useState(false);
  
  // Get user information
  const userEmail = getCurrentUserEmail();
  const userPlan = getUserPlan(userEmail);
  
  // Get trial/subscription information
  const isTrialPlan = userPlan.plan === PlanType.FREE_TRIAL;
  const isTrialExpired = hasTrialExpired(userEmail);
  const isSubscriptionExpired = hasSubscriptionExpired(userEmail);

  const handleCreateAgent = useCallback(async (type) => {
    setIsChecking(true);
    
    try {
      // Check if the user can create more agents based on database rules
      const canCreate = await canCreateAgent(userEmail);
      
      // Check if the user can create more agents
      if (!canCreate) {
        // Determine the reason why user can't create an agent
        if (isTrialPlan && isTrialExpired) {
          toast({
            title: "Teste gratuito expirado",
            description: "Seu período de teste gratuito expirou. Por favor, faça upgrade para um plano pago.",
            variant: "destructive"
          });
        } else if (!isTrialPlan && isSubscriptionExpired) {
          toast({
            title: "Assinatura expirada",
            description: "Sua assinatura expirou. Por favor, renove seu plano para continuar usando.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Limite de plano atingido",
            description: "Seu plano atual não permite a criação de mais agentes. Por favor, faça upgrade para um plano maior.",
            variant: "destructive"
          });
        }
        
        // Add a small delay before redirecting to prevent loop issues
        setTimeout(() => navigate('/plans'), 100);
      } else {
        // Navigate to create agent page with selected type
        navigate(`/create-agent?type=${type}`);
      }
    } catch (error) {
      console.error("Error checking agent creation permissions:", error);
      toast({
        title: "Erro de verificação",
        description: "Ocorreu um erro ao verificar suas permissões. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  }, [navigate, toast, userEmail, isTrialPlan, isTrialExpired, isSubscriptionExpired]);

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-8">
        <WelcomeHeader onCreateAgent={() => navigate('/dashboard?tab=discover')} />
        
        <div className="w-full">
          <AgentTypeTabs 
            currentTab={currentTab}
            onCreateAgent={handleCreateAgent}
            isChecking={isChecking}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
