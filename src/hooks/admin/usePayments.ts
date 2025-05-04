import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Payment {
  id: string;
  user_id: string;
  email: string;
  plan: number;
  plan_name: string;
  amount: number;
  payment_date: string;
  expiration_date: string;
  status: string;
}

interface CreatePaymentData {
  email: string;
  plan: number;
  amount: number;
  payment_date: string;
  expiration_date: string;
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadPayments() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          admin_users!user_id (
            email
          )
        `)
        .order('payment_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedPayments = data.map(payment => ({
        id: payment.id,
        user_id: payment.user_id,
        email: payment.admin_users?.email || '',
        plan: payment.plan,
        plan_name: payment.plan === 0 ? 'Teste Gratuito' :
                  payment.plan === 1 ? 'Inicial' :
                  payment.plan === 2 ? 'Padrão' :
                  'Premium',
        amount: payment.amount,
        payment_date: payment.payment_date,
        expiration_date: payment.expiration_date,
        status: payment.status
      }));

      setPayments(formattedPayments);
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setIsLoading(false);
    }
  }

  async function createPayment(data: CreatePaymentData) {
    try {
      // Primeiro busca o user_id pelo email
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .select('id, user_id')
        .eq('email', data.email)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error('Usuário não encontrado');

      // Cria o pagamento
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userData.user_id,
          plan: data.plan,
          amount: data.amount,
          payment_date: data.payment_date,
          expiration_date: data.expiration_date,
          status: 'Pago'
        });

      if (paymentError) throw paymentError;

      // Atualiza o plano do usuário
      const { error: planError } = await supabase
        .from('user_plans')
        .upsert({
          user_id: userData.user_id,
          plan: data.plan,
          name: data.plan === 0 ? 'Teste Gratuito' :
                data.plan === 1 ? 'Inicial' :
                data.plan === 2 ? 'Padrão' :
                'Premium',
          agent_limit: data.plan === 0 ? 1 :
                      data.plan === 1 ? 1 :
                      data.plan === 2 ? 3 :
                      10
        });

      if (planError) throw planError;

      toast.success('Pagamento registrado com sucesso');
      loadPayments();
    } catch (err) {
      console.error('Erro ao criar pagamento:', err);
      toast.error('Erro ao registrar pagamento');
      throw err;
    }
  }

  return {
    payments,
    isLoading,
    loadPayments,
    createPayment
  };
} 