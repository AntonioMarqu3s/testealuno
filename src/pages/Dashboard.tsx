
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
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { AgentTypeTabs } from "@/components/dashboard/AgentTypeTabs";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useCallback, useState } from "react";
import { canCreateAgent } from "@/services/plan/planLimitService";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'agents';
  const [isChecking, setIsChecking] = useState(false);
  
  // Get user information
  const userEmail = getCurrentUserEmail();
  const userPlan = getUserPlan(userEmail);
  const userAgents = getUserAgents(userEmail);
  
  // Get trial information
  const trialDaysRemaining = getTrialDaysRemaining(userEmail);
  const isTrialExpired = hasTrialExpired(userEmail);
  const isSubscriptionExpired = hasSubscriptionExpired(userEmail);
  const isTrialPlan = userPlan.plan === PlanType.FREE_TRIAL;

  const handleCreateAgent = useCallback(async () => {
    setIsChecking(true);
    
    try {
      // Check if the user can create more agents based on database rules
      const canCreate = await canCreateAgent(userEmail);
      
      // Check if the user can create more agents
      if (!canCreate) {
        // Different messages based on plan type
        if (userPlan.plan >= 1 && isSubscriptionExpired) {
          toast({
            title: "Assinatura expirada",
            description: "Sua assinatura expirou. Por favor, renove seu plano para continuar usando nossos serviços.",
            variant: "destructive"
          });
        } else if (userPlan.plan === PlanType.FREE_TRIAL && isTrialExpired) {
          toast({
            title: "Período de teste expirado",
            description: "Seu período de teste gratuito expirou. Por favor, faça upgrade para um plano pago para continuar.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Limite de plano atingido",
            description: "Seu plano atual não permite a criação de mais agentes. Por favor, faça upgrade para um plano pago.",
            variant: "destructive"
          });
        }
        
        // Add a small delay before redirecting to prevent loop issues
        setTimeout(() => navigate('/plans'), 100);
      } else {
        // Navigate to agent type selection
        navigate('/create-agent');
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
  }, [navigate, toast, userEmail, userPlan, isTrialExpired, isSubscriptionExpired]);

  const handleNavigateToMyAgents = useCallback(() => {
    navigate('/agents');
  }, [navigate]);
  
  const handleUpgrade = useCallback(() => {
    navigate('/plans');
  }, [navigate]);

  const memoizedUserAgentsCount = useMemo(() => userAgents.length, [userAgents]);
  const memoizedPlanName = useMemo(() => userPlan.name, [userPlan]);

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-8">
        <WelcomeHeader onCreateAgent={handleCreateAgent} />
        
        {isTrialPlan && (
          <TrialBanner 
            isTrialExpired={isTrialExpired}
            trialDaysRemaining={trialDaysRemaining}
            onUpgrade={handleUpgrade}
          />
        )}
        
        {userPlan.plan >= 1 && isSubscriptionExpired && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
            <h3 className="font-medium text-red-800">Sua assinatura expirou</h3>
            <p className="text-red-700 mt-1">
              Sua assinatura expirou. Renove agora para continuar usando todos os recursos.
            </p>
            <button 
              onClick={handleUpgrade}
              className="mt-2 inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Renovar agora
            </button>
          </div>
        )}
        
        <AgentTypeTabs 
          currentTab={currentTab}
          onCreateAgent={handleCreateAgent}
          onNavigateToAgents={handleNavigateToMyAgents}
          isChecking={isChecking}
        />

        <DashboardCards 
          userAgentsCount={memoizedUserAgentsCount}
          agentLimit={userPlan.agentLimit}
          planName={memoizedPlanName}
          isTrialPlan={isTrialPlan}
          isTrialExpired={isTrialExpired}
          trialDaysRemaining={trialDaysRemaining}
          onUpgrade={handleUpgrade}
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
