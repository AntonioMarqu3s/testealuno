
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { getCurrentUserEmail } from "@/services/user/userService";
import { 
  getUserPlan, 
  PlanType, 
  getTrialDaysRemaining, 
  hasTrialExpired 
} from "@/services/plan/userPlanService";
import { getUserAgents } from "@/services/agent/agentStorageService";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { AgentTypeTabs } from "@/components/dashboard/AgentTypeTabs";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useCallback } from "react";
import { canCreateAgent } from "@/services/plan/planLimitService";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'agents';
  
  // Get user information
  const userEmail = getCurrentUserEmail();
  const userPlan = getUserPlan(userEmail);
  const userAgents = getUserAgents(userEmail);
  
  // Get trial information
  const trialDaysRemaining = getTrialDaysRemaining(userEmail);
  const isTrialExpired = hasTrialExpired(userEmail);
  const isTrialPlan = userPlan.plan === PlanType.FREE_TRIAL;

  const handleCreateAgent = useCallback(() => {
    const canCreate = canCreateAgent(userEmail);
    
    // Check if the user can create more agents
    if (!canCreate) {
      toast({
        title: "Limite de plano atingido",
        description: "Seu plano atual não permite a criação de mais agentes. Por favor, faça upgrade para um plano pago.",
        variant: "destructive"
      });
      // Add a small delay before redirecting to prevent loop issues
      setTimeout(() => navigate('/plans'), 100);
    } else {
      // Navigate to agent type selection
      navigate('/create-agent');
    }
  }, [navigate, toast, userEmail]);

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
        
        <AgentTypeTabs 
          currentTab={currentTab}
          onCreateAgent={handleCreateAgent}
          onNavigateToAgents={handleNavigateToMyAgents}
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
