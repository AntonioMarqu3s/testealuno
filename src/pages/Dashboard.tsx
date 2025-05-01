
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

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleCreateAgent = () => {
    // Navigate to agent type selection
    navigate('/create-agent');
  };

  const handleNavigateToMyAgents = () => {
    navigate('/agents');
  };
  
  const handleUpgrade = () => {
    navigate('/plan-checkout');
  };

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
          userAgentsCount={userAgents.length}
          agentLimit={userPlan.agentLimit}
          planName={userPlan.name}
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
