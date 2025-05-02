
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserEmail } from "@/services";
import { getUserPlan, getTrialDaysRemaining, getSubscriptionDaysRemaining, PlanType } from "@/services/plan/userPlanService";
import { useAuth } from "@/context/AuthContext";
import { UserEmailForm } from "@/components/auth/UserEmailForm";

export default function Settings() {
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState<string>("");
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    // Get current user email
    const email = user?.email || getCurrentUserEmail();
    setUserEmail(email || "");

    // Get user plan details
    if (email) {
      const userPlan = getUserPlan(email);
      setPlan(userPlan);
    }
  }, [user?.email]);

  // Format dates for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Get days remaining (either trial or subscription)
  const getDaysRemaining = () => {
    if (!userEmail) return 0;
    
    if (plan?.plan === PlanType.FREE_TRIAL) {
      return getTrialDaysRemaining(userEmail);
    } else {
      return getSubscriptionDaysRemaining(userEmail);
    }
  };

  // Get plan expiration date
  const getExpirationDate = () => {
    if (!plan) return "N/A";
    
    if (plan.plan === PlanType.FREE_TRIAL && plan.trialEndsAt) {
      return formatDate(plan.trialEndsAt);
    } else if (plan.subscriptionEndsAt) {
      return formatDate(plan.subscriptionEndsAt);
    }
    
    return "N/A";
  };

  // Get plan start date
  const getPlanStartDate = () => {
    if (!plan) return "N/A";

    if (plan.paymentDate) {
      return formatDate(plan.paymentDate);
    } else {
      // Use updatedAt as fallback for start date
      return formatDate(plan.updatedAt);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-5xl py-8">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        
        <div className="grid gap-6">
          {/* User Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <UserEmailForm />
              </div>
            </CardContent>
          </Card>
          
          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Plano Atual</div>
                  <div className="font-semibold text-lg">{plan?.name || "Carregando..."}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Limite de Agentes</div>
                  <div className="font-semibold text-lg">{plan?.agentLimit || "N/A"}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Data de Início</div>
                  <div className="font-semibold">{getPlanStartDate()}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Data de Expiração</div>
                  <div className="font-semibold">{getExpirationDate()}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Dias Restantes</div>
                  <div className="font-semibold">{getDaysRemaining()}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Status do Pagamento</div>
                  <div className="font-semibold">{plan?.paymentStatus ? (plan.paymentStatus === 'completed' ? 'Completo' : 'Pendente') : 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
