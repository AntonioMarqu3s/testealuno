
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserEmail } from "@/services";
import { getUserPlan, getTrialDaysRemaining, getSubscriptionDaysRemaining, PlanType } from "@/services/plan/userPlanService";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState<string>("");
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserData() {
      setIsLoading(true);
      try {
        // Get current user email
        const email = user?.email || await getCurrentUserEmail();
        setUserEmail(email || "");

        if (email) {
          // Try to get user plan from Supabase first
          if (user?.id) {
            const { data, error } = await supabase
              .from('user_plans')
              .select('*')
              .eq('user_id', user.id)
              .single();

            if (data) {
              // Convert Supabase data to match our local format
              setPlan({
                plan: data.plan,
                name: data.name,
                agentLimit: data.agent_limit,
                trialEndsAt: data.trial_ends_at,
                subscriptionEndsAt: data.subscription_ends_at,
                paymentDate: data.payment_date,
                paymentStatus: data.payment_status,
                updatedAt: data.updated_at
              });
              console.log("Loaded plan data from Supabase:", data);
              setIsLoading(false);
              return;
            } else if (error && !error.message.includes('No rows found')) {
              console.error("Error loading user plan from Supabase:", error);
            }
          }
          
          // Fallback to local storage if no Supabase data
          const userPlan = getUserPlan(email);
          setPlan(userPlan);
          console.log("Loaded plan data from localStorage:", userPlan);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Erro ao carregar dados do usuário");
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, [user?.email, user?.id]);

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
    } else if (plan.updatedAt) {
      // Use updatedAt as fallback for start date
      return formatDate(plan.updatedAt);
    }
    
    return "N/A";
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
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Somente leitura)</Label>
                  <Input 
                    id="email"
                    value={userEmail}
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Este email está associado às suas instâncias de agente. 
                    Não é possível alterá-lo, pois isso afetaria a identificação dos seus agentes.
                    Para alterar, contate o administrador.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Plano Atual</div>
                    <div className="font-semibold text-lg">{plan?.name || "Não definido"}</div>
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
