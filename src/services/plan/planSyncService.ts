
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/services/auth/supabaseAuth";
import { getUserPlan, PlanType, updateUserPlan } from "@/services/plan/userPlanService";
import { getUserPlanFromSupabase } from "@/services/plan/supabsePlanService";
import { toast } from "sonner";
import { Location as RouterLocation } from "react-router-dom";

/**
 * Força uma sincronização do plano do usuário entre o Supabase e o localStorage
 * Útil após um pagamento para garantir que o plano foi atualizado
 */
export const forceSyncUserPlanWithSupabase = async (): Promise<boolean> => {
  try {
    console.log("Forçando sincronização de plano com o Supabase");
    
    // Obter o usuário atual do Supabase
    const user = await getCurrentUser();
    
    if (!user || !user.email) {
      console.log("Usuário não autenticado ou sem email");
      return false;
    }
    
    return await syncUserPlan(user.email);
  } catch (error) {
    console.error("Erro ao sincronizar plano:", error);
    return false;
  }
};

/**
 * Sincroniza o plano do usuário entre o Supabase e o localStorage
 * Útil após um pagamento para garantir que o plano foi atualizado
 */
export const syncUserPlan = async (userEmail: string): Promise<boolean> => {
  try {
    console.log("Sincronizando plano do usuário:", userEmail);
    
    // Obter o usuário atual do Supabase
    const user = await getCurrentUser();
    
    if (!user) {
      console.log("Usuário não autenticado");
      return false;
    }
    
    // Obter o plano do Supabase
    const supabasePlan = await getUserPlanFromSupabase(user.id);
    console.log("Plano do Supabase:", supabasePlan);
    
    // Obter o plano do localStorage
    const localPlan = getUserPlan(userEmail);
    console.log("Plano local:", localPlan);
    
    // Se não tiver plano no Supabase, não há nada a sincronizar
    if (!supabasePlan) {
      console.log("Plano não encontrado no Supabase");
      return false;
    }
    
    // Verificar se os planos são diferentes para evitar loops infinitos
    const planChanged = 
      supabasePlan.plan !== localPlan.plan || 
      supabasePlan.name !== localPlan.name || 
      supabasePlan.agentLimit !== localPlan.agentLimit ||
      supabasePlan.paymentStatus !== localPlan.paymentStatus;
    
    // Sempre usar o plano do Supabase como fonte da verdade, mas só atualizar se houver mudança
    if (planChanged) {
      console.log("Planos diferentes detectados, atualizando localmente com dados do Supabase");
      
      // Atualizar localmente com dados do Supabase
      updateUserPlan(
        userEmail, 
        supabasePlan.plan, 
        supabasePlan.paymentDate, 
        supabasePlan.subscriptionEndsAt, 
        supabasePlan.paymentStatus
      );
      
      // Mostrar toast de sucesso se o plano local foi atualizado
      toast.success("Seu plano foi atualizado com sucesso!", {
        description: `Agora você está no plano ${supabasePlan.name}.`,
        duration: 5000,
      });
      
      return true;
    } else {
      console.log("Planos já estão sincronizados, nenhuma ação necessária");
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao sincronizar plano:", error);
    return false;
  }
};

/**
 * Verifica se há um código de confirmação de pagamento na URL
 * e atualiza o plano do usuário se necessário
 */
export const checkPaymentConfirmation = async (location: RouterLocation, userEmail: string): Promise<boolean> => {
  const searchParams = new URLSearchParams(location.search);
  const paymentConfirmed = searchParams.get('payment_confirmed');
  const planType = searchParams.get('plan');
  
  if (paymentConfirmed === 'true' && planType) {
    try {
      console.log(`Confirmação de pagamento detectada para plano: ${planType}`);
      const planTypeNumber = parseInt(planType, 10);
      
      if (!isNaN(planTypeNumber)) {
        // Atualizar plano localmente
        updateUserPlan(userEmail, planTypeNumber, new Date().toISOString());
        
        // Atualizar plano no Supabase
        const user = await getCurrentUser();
        if (user) {
          await updateUserPlan(userEmail, planTypeNumber, new Date().toISOString());
          
          toast.success("Pagamento confirmado!", {
            description: `Seu plano foi atualizado para ${PlanType[planTypeNumber]}.`,
            duration: 5000,
          });
          
          return true;
        }
      }
    } catch (error) {
      console.error("Erro ao processar confirmação de pagamento:", error);
    }
  }
  
  return false;
};

/**
 * Utilitário para verificar o plano atual e garantir que está sincronizado
 */
export const checkAndSyncPlan = async (location: RouterLocation, userEmail: string): Promise<void> => {
  // Primeiro verifica se há confirmação de pagamento na URL
  const paymentProcessed = await checkPaymentConfirmation(location, userEmail);
  
  // Sempre sincroniza os planos para garantir que estão atualizados
  if (!paymentProcessed) {
    await syncUserPlan(userEmail);
  }
};
