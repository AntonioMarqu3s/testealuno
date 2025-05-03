
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/services/auth/supabaseAuth";
import { getUserPlan, PlanType, updateUserPlan } from "@/services/plan/userPlanService";
import { getUserPlanFromSupabase, updateUserPlanInSupabase } from "@/services/plan/supabsePlanService";
import { toast } from "sonner";

/**
 * Força uma sincronização do plano do usuário entre o Supabase e o localStorage
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
    
    // Se não tiver plano no Supabase, enviar o plano local para o Supabase
    if (!supabasePlan) {
      console.log("Plano não encontrado no Supabase, enviando plano local");
      await updateUserPlanInSupabase(user.id, localPlan.plan);
      return true;
    }
    
    // Se tiver planos diferentes, usar o mais alto entre eles
    if (supabasePlan.plan !== localPlan.plan) {
      console.log("Planos diferentes detectados");
      
      const highestPlan = Math.max(supabasePlan.plan, localPlan.plan);
      console.log(`Usando o plano mais alto: ${highestPlan}`);
      
      // Atualizar localmente e no Supabase para o plano mais alto
      if (highestPlan !== supabasePlan.plan) {
        await updateUserPlanInSupabase(user.id, highestPlan);
      }
      
      if (highestPlan !== localPlan.plan) {
        updateUserPlan(userEmail, highestPlan, new Date().toISOString());
        
        // Mostrar toast de sucesso se o plano local foi atualizado
        toast.success("Seu plano foi atualizado com sucesso!", {
          description: `Agora você está no plano ${PlanType[highestPlan]}.`,
          duration: 5000,
        });
        
        return true;
      }
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
export const checkPaymentConfirmation = async (location: Location, userEmail: string): Promise<boolean> => {
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
          await updateUserPlanInSupabase(user.id, planTypeNumber);
        }
        
        toast.success("Pagamento confirmado!", {
          description: `Seu plano foi atualizado para ${PlanType[planTypeNumber]}.`,
          duration: 5000,
        });
        
        return true;
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
export const checkAndSyncPlan = async (location: Location, userEmail: string): Promise<void> => {
  // Primeiro verifica se há confirmação de pagamento na URL
  const paymentProcessed = await checkPaymentConfirmation(location, userEmail);
  
  // Se não houver confirmação de pagamento, sincroniza os planos
  if (!paymentProcessed) {
    await syncUserPlan(userEmail);
  }
};
