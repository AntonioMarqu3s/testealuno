
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
import { ResourcesCard } from "@/components/dashboard/ResourcesCard";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useState } from "react";
import { canCreateAgent } from "@/services/plan/planLimitService";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  
  // Get user information
  const userEmail = getCurrentUserEmail();
  const userPlan = getUserPlan(userEmail);
  const userAgents = getUserAgents(userEmail);
  
  // Get trial/subscription information
  const trialDaysRemaining = getTrialDaysRemaining(userEmail);
  const isTrialExpired = hasTrialExpired(userEmail);
  const isTrialPlan = userPlan.plan === PlanType.FREE_TRIAL;
  const isSubscriptionExpired = hasSubscriptionExpired(userEmail);

  const handleCreateAgent = useCallback(async () => {
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
        // Navigate to agent type selection
        navigate('/dashboard?tab=discover');
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

  const handleUpgrade = useCallback(() => {
    navigate('/plans');
  }, [navigate]);

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-8">
        <WelcomeHeader onCreateAgent={handleCreateAgent} />
        
        <div className="max-w-md mx-auto">
          <ResourcesCard 
            userAgentsCount={userAgents.length}
            agentLimit={userPlan.agentLimit}
            planName={userPlan.name}
            isTrialPlan={isTrialPlan}
            isTrialExpired={isTrialExpired}
            isSubscriptionExpired={isSubscriptionExpired}
            trialDaysRemaining={trialDaysRemaining}
            onUpgrade={handleUpgrade}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
