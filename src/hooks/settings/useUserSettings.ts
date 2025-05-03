
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUserEmail, forceSyncUserPlanWithSupabase } from "@/services";
import { getUserPlan, getTrialDaysRemaining, getSubscriptionDaysRemaining, PlanType } from "@/services/plan/userPlanService";
import { supabase } from "@/lib/supabase";
import { UserPlan } from "@/services/plan/planTypes"; 
import { toast } from "sonner";

export function useUserSettings() {
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState<string>("");
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);

  const loadUserData = async () => {
    // Evitar chamadas repetitivas em períodos curtos
    const now = Date.now();
    if (now - lastSyncTime < 2000) { // Limita para no máximo uma chamada a cada 2 segundos
      console.log("Ignorando chamada repetitiva para loadUserData");
      return;
    }
    
    setLastSyncTime(now);
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
  };

  useEffect(() => {
    if (user?.email || user?.id) {
      loadUserData();
    }
  }, [user?.email, user?.id]);

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
        toast.info("Não houve alterações para sincronizar");
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

  return {
    userEmail,
    plan,
    isLoading,
    isSyncing,
    handleSyncUserPlan,
    getDaysRemaining,
    getExpirationDate,
    getPlanStartDate
  };
}
