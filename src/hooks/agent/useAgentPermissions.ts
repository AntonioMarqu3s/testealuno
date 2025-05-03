
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan, PlanType } from "@/services/plan/userPlanService";
import { canCreateAgent } from "@/services";
import { getUserPlanFromSupabase } from "@/services/plan/supabsePlanService";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/services/auth/supabaseAuth";

export const useAgentPermissions = (agentType: string | null, isEdit: boolean) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [userPlan, setUserPlan] = useState<any>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      setIsChecking(true);
      
      // Get user email and plan
      const userEmail = getCurrentUserEmail();
      let localUserPlan = getUserPlan(userEmail);
      
      // Always check for the latest plan information from Supabase
      try {
        const user = await getCurrentUser();
        
        if (user) {
          const supabasePlan = await getUserPlanFromSupabase(user.id);
          
          if (supabasePlan) {
            console.log("Plano recuperado do Supabase:", supabasePlan);
            setUserPlan(supabasePlan);
            localUserPlan = supabasePlan;
          } else {
            console.log("Plano não encontrado no Supabase, usando plano local");
            setUserPlan(localUserPlan);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar plano no Supabase:", error);
      }
      
      // If editing, we don't need to check permissions
      if (isEdit) {
        setIsChecking(false);
        return;
      }
      
      // Check if user can create an agent
      const canCreate = await canCreateAgent(userEmail);
      
      if (!canCreate) {
        toast({
          title: localUserPlan.plan === PlanType.FREE_TRIAL ? 
            "Plano gratuito" : 
            "Limite de agentes atingido",
          description: localUserPlan.plan === PlanType.FREE_TRIAL ? 
            "Seu plano gratuito não permite a criação de agentes. Por favor, faça upgrade para um plano pago." :
            `Seu plano atual permite apenas ${localUserPlan.agentLimit} agentes. Faça upgrade para criar mais.`,
          variant: "destructive"
        });
        navigate('/plans');
        return;
      }
      
      // Check if type is valid, if not redirect
      if (!agentType && !isEdit) {
        toast({
          title: "Selecione um tipo de agente",
          description: "Por favor, escolha um tipo de agente antes de prosseguir com a criação.",
        });
        navigate('/dashboard?tab=agents');
      }
      
      setIsChecking(false);
    };
    
    checkPermissions();
  }, [agentType, isEdit, toast, navigate]);

  return { isChecking, userPlan };
};
