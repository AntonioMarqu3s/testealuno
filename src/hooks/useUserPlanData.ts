
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getUserPlan } from "@/services/plan/userPlanService";
import { getCurrentUserEmail } from "@/services";

export function useUserPlanData() {
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
    }

    loadUserData();
  }, [user?.email, user?.id]);

  return {
    userEmail,
    plan,
    isLoading
  };
}
