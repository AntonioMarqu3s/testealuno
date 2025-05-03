
import { supabase } from '@/lib/supabase';
import { PlanType, UserPlan, PLAN_DETAILS } from './planTypes';
import { updateUserPlan } from './planUpdateService';
import { toast } from 'sonner';

/**
 * Interface para os dados retornados após a atualização do plano
 */
export interface PlanUpdateResult {
  success: boolean;
  plan?: UserPlan;
  error?: string;
}

/**
 * Atualiza o plano do usuário no Supabase e localmente
 * @param userId ID do usuário no Supabase
 * @param userEmail Email do usuário
 * @param planType Tipo do plano (PlanType) a ser atualizado
 * @param paymentDate Data do pagamento (opcional, usa a data atual se não for fornecido)
 * @param discountCoupon Código de desconto aplicado (opcional)
 */
export const updateUserPlanExternal = async (
  userId: string,
  userEmail: string,
  planType: PlanType,
  paymentDate: Date = new Date(),
  discountCoupon?: string
): Promise<PlanUpdateResult> => {
  try {
    console.log(`Atualizando plano do usuário ${userEmail} para ${PlanType[planType]}`);
    
    // Calcular data de término da assinatura (30 dias a partir da data do pagamento)
    const subscriptionEndsAt = new Date(paymentDate);
    subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30); // 30 dias de assinatura
    
    // Atualizar no Supabase
    const { error } = await supabase
      .from('user_plans')
      .upsert({
        user_id: userId,
        plan: planType,
        name: PLAN_DETAILS[planType].name,
        agent_limit: PLAN_DETAILS[planType].agentLimit,
        payment_date: paymentDate.toISOString(),
        payment_status: 'completed',
        subscription_ends_at: subscriptionEndsAt.toISOString(),
        trial_ends_at: null, // Remover data de término do período de teste para planos pagos
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Erro ao atualizar plano no Supabase:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Atualizar localmente
    updateUserPlan(
      userEmail,
      planType,
      paymentDate.toISOString(),
      subscriptionEndsAt.toISOString(),
      'completed'
    );
    
    // Buscar os dados atualizados para retornar
    const { data: planData } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (planData) {
      const userPlan: UserPlan = {
        plan: planData.plan as PlanType,
        name: planData.name,
        agentLimit: planData.agent_limit,
        trialEndsAt: planData.trial_ends_at,
        subscriptionEndsAt: planData.subscription_ends_at,
        paymentDate: planData.payment_date,
        paymentStatus: planData.payment_status,
        connectInstancia: planData.connect_instancia || false,
        updatedAt: planData.updated_at
      };
      
      return {
        success: true,
        plan: userPlan
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Exceção ao atualizar plano:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

/**
 * Obter os detalhes de um plano pelo ID
 */
export const getPlanDetails = (planType: PlanType) => PLAN_DETAILS[planType];
