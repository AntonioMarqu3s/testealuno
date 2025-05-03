
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserEmail, forceSyncUserPlanWithSupabase } from "@/services";
import { getUserPlan, getTrialDaysRemaining, getSubscriptionDaysRemaining, PlanType } from "@/services/plan/userPlanService";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updatePlanConnectionStatus } from "@/services/plan/planConnectionService";
import { Loader2, RefreshCw } from "lucide-react";
import { ManualPlanUpdate } from "@/components/plan/ManualPlanUpdate";

export default function Settings() {
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState<string>("");
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectInstancia, setConnectInstancia] = useState(false);
  const [isUpdatingConnection, setIsUpdatingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadUserData = async () => {
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
              connectInstancia: data.connect_instancia,
              updatedAt: data.updated_at
            });
            setConnectInstancia(data.connect_instancia || false);
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
        setConnectInstancia(userPlan.connectInstancia || false);
        console.log("Loaded plan data from localStorage:", userPlan);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Erro ao carregar dados do usuário");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user?.email, user?.id]);

  // Handle connection toggle
  const handleConnectionToggle = async () => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para alterar essa configuração");
      return;
    }

    setIsUpdatingConnection(true);
    try {
      const success = await updatePlanConnectionStatus(user.id, !connectInstancia);
      if (success) {
        setConnectInstancia(!connectInstancia);
        toast.success(
          !connectInstancia 
            ? "Conexão automática ativada" 
            : "Conexão automática desativada"
        );
      } else {
        toast.error("Erro ao atualizar a configuração");
      }
    } catch (error) {
      console.error("Error updating connection status:", error);
      toast.error("Erro ao atualizar a configuração");
    } finally {
      setIsUpdatingConnection(false);
    }
  };

  // Handle manual sync of user plan data
  const handleSyncUserPlan = async () => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para sincronizar os dados");
      return;
    }

    setIsSyncing(true);
    try {
      const success = await forceSyncUserPlanWithSupabase();
      if (success) {
        toast.success("Dados sincronizados com sucesso");
        // Reload user data after sync
        await loadUserData();
      } else {
        toast.error("Erro ao sincronizar dados");
      }
    } catch (error) {
      console.error("Error syncing user plan data:", error);
      toast.error("Erro ao sincronizar dados");
    } finally {
      setIsSyncing(false);
    }
  };

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
          
          {/* Auto Connection Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Conexão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Conectar instâncias automaticamente</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ao ativar, novos agentes tentarão se conectar automaticamente quando criados
                  </p>
                </div>
                <Switch 
                  checked={connectInstancia}
                  onCheckedChange={handleConnectionToggle}
                  disabled={isUpdatingConnection || isLoading}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Manual Plan Update */}
          <Card>
            <CardHeader>
              <CardTitle>Atualização Manual de Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <ManualPlanUpdate 
                userEmail={userEmail} 
                onUpdateComplete={loadUserData}
              />
            </CardContent>
          </Card>
          
          {/* Subscription Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informações de Assinatura</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSyncUserPlan}
                disabled={isSyncing || isLoading}
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sincronizar Dados
              </Button>
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
