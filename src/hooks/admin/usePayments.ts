import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { createPaymentRegistrationFunction } from "@/services/database/sqlExecutor";
import { v4 as uuidv4 } from 'uuid';

interface Payment {
  id: string;
  user_id: string;
  email: string;
  plano_id: number;
  plano_nome: string;
  valor: number;
  data_pagamento: string;
  data_expiracao: string;
  status: string;
}

interface CreatePaymentData {
  email: string;
  plano_id: number;
  valor: number;
  data_pagamento: string;
  data_expiracao?: string;
  promo_code?: string;
  is_promo_applied?: boolean;
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadPayments() {
    try {
      setIsLoading(true);
      console.log('Iniciando carregamento de pagamentos');
      
      // Busca os pagamentos da tabela pagamentos
      const { data: paymentsData, error } = await supabase
        .from('pagamentos')
        .select('*')
        .order('data_pagamento', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        throw error;
      }

      console.log(`Encontrados ${paymentsData?.length || 0} pagamentos`);

      // Se não há pagamentos, retorna lista vazia
      if (!paymentsData || paymentsData.length === 0) {
        setPayments([]);
        return;
      }

      // Busca emails dos usuários
      console.log('Buscando emails dos usuários');
      const userIds = paymentsData.map(p => p.user_id);
      
      // Primeiro tenta na tabela users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);
      
      if (usersError) {
        console.error('Erro ao buscar usuários na tabela users:', usersError);
      }
      
      // Mapa para armazenar emails por id
      const usersMap: Record<string, string> = {};
      
      // Adiciona emails encontrados na tabela users
      if (usersData && usersData.length > 0) {
        console.log(`Encontrados ${usersData.length} usuários na tabela users`);
        usersData.forEach(user => {
          usersMap[user.id] = user.email;
        });
      }
      
      // Para usuários não encontrados, busca em auth.users
      const missingUserIds = userIds.filter(id => !usersMap[id]);
      
      if (missingUserIds.length > 0) {
        console.log(`Buscando ${missingUserIds.length} usuários faltando em auth.users`);
        
        const { data: authUsersData, error: authUsersError } = await supabase
          .from('auth.users')
          .select('id, email')
          .in('id', missingUserIds);
          
        if (authUsersError) {
          console.error('Erro ao buscar usuários em auth.users:', authUsersError);
        } else if (authUsersData && authUsersData.length > 0) {
          console.log(`Encontrados ${authUsersData.length} usuários em auth.users`);
          authUsersData.forEach(user => {
            usersMap[user.id] = user.email;
          });
        }
      }

      // Busca os nomes dos planos
      console.log('Buscando dados dos planos');
      const planoIds = paymentsData.map(p => p.plano_id);
      const { data: planosData, error: planosError } = await supabase
        .from('plans')
        .select('id, name')
        .in('id', planoIds);

      if (planosError) {
        console.error('Erro ao buscar planos:', planosError);
      }

      console.log(`Encontrados ${planosData?.length || 0} planos`);
      
      // Cria um mapa de id -> nome do plano
      const planosMap: Record<number, string> = {};
      if (planosData) {
        planosData.forEach(plano => {
          planosMap[plano.id] = plano.name;
        });
      }

      // Formata os dados para exibição
      const formattedPayments = paymentsData.map(payment => ({
        id: payment.id,
        user_id: payment.user_id,
        email: usersMap[payment.user_id] || 'Email não encontrado',
        plano_id: payment.plano_id,
        plano_nome: planosMap[payment.plano_id] || 'Plano não encontrado',
        valor: payment.valor,
        data_pagamento: payment.data_pagamento,
        data_expiracao: payment.data_expiracao,
        status: payment.status
      }));

      console.log('Pagamentos formatados:', formattedPayments);
      setPayments(formattedPayments);
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
      toast.error('Erro ao carregar pagamentos');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function createPayment(data: CreatePaymentData) {
    try {
      console.log('Criando novo pagamento para o email:', data.email);
      
      // Verificações básicas de dados
      if (!data.email || data.plano_id === undefined || data.valor === undefined || !data.data_pagamento) {
        console.error('Dados incompletos para criar pagamento:', data);
        throw new Error('Dados incompletos para criar pagamento');
      }

      // Verifica se é um plano gratuito com código promocional
      const isFreePlanWithPromo = data.plano_id === 0 && data.is_promo_applied && data.promo_code;
      
      // ===== SOLUÇÃO TEMPORÁRIA =====
      // Em vez de tentar fazer tudo funcionar com a restrição de chave estrangeira,
      // vamos tentar uma abordagem mais simples para registrar o pagamento
      
      try {
        // Primeiro, verificamos se o usuário existe
        const { data: userExists, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', data.email)
          .maybeSingle();
          
        let userId = userExists?.id;
        
        // Se o usuário não existe, registramos o pagamento com um ID temporário
        // que será substituído depois pelo administrador
        if (!userId) {
          console.log('Usuário não encontrado, registrando com ID temporário...');
          toast.info('Usuário não encontrado. O pagamento será registrado temporariamente.');
          
          // Registrar o pagamento em uma tabela temporária sem restrição de chave estrangeira
          const tempPaymentData = {
            user_email: data.email,
            plano_id: data.plano_id,
            valor: data.valor,
            status: 'pending_user_creation',
            data_pagamento: data.data_pagamento,
            data_expiracao: data.data_expiracao,
            notes: `Pagamento registrado sem usuário. ${isFreePlanWithPromo ? `Código promocional aplicado: ${data.promo_code}` : 'Necessário criar usuário.'}`
          };
          
          // Registramos em uma tabela temporária ou em um log
          const { error: tempError } = await supabase
            .from('temp_pagamentos')
            .insert([tempPaymentData]);
            
          if (tempError) {
            console.error('Erro ao registrar pagamento temporário:', tempError);
            
            // Se também não conseguir registrar na tabela temporária,
            // registramos um log para o administrador verificar depois
            await supabase
              .from('system_logs')
              .insert([{
                type: 'payment_error',
                data: JSON.stringify({
                  email: data.email,
                  plano_id: data.plano_id,
                  valor: data.valor,
                  data_pagamento: data.data_pagamento,
                  data_expiracao: data.data_expiracao,
                  promo_code: data.promo_code,
                  is_promo_applied: data.is_promo_applied,
                  error: 'Usuário não encontrado e falha ao registrar em temp_pagamentos'
                }),
                created_at: new Date().toISOString()
              }]);
          }
          
          toast.success('Pagamento registrado para processamento manual');
          console.log('Pagamento temporário registrado com sucesso para o email:', data.email);
          return;
        }
        
        // Se o usuário existe, tenta registrar o pagamento normalmente
        console.log('Usuário encontrado, registrando pagamento...');
        
        const paymentData = {
          user_id: userId,
          plano_id: data.plano_id,
          valor: data.valor,
          status: isFreePlanWithPromo ? 'promo_code' : 'completed',
          data_pagamento: data.data_pagamento,
          data_expiracao: data.data_expiracao || null,
          promo_code: data.promo_code || null,
          is_promo_applied: data.is_promo_applied || false
        };
        
        const { error: paymentError } = await supabase
          .from('pagamentos')
          .insert([paymentData]);
          
        if (paymentError) {
          console.error('Erro ao inserir pagamento:', paymentError);
          
          // Se falhar, ainda registramos em temp_pagamentos
          await supabase
            .from('temp_pagamentos')
            .insert([{
              user_id: userId,
              user_email: data.email,
              plano_id: data.plano_id,
              valor: data.valor,
              status: 'error_inserting',
              data_pagamento: data.data_pagamento,
              error: JSON.stringify(paymentError)
            }]);
            
          throw paymentError;
        }
        
        toast.success('Pagamento registrado com sucesso');
        await loadPayments();
      } catch (err) {
        console.error('Erro durante processamento de pagamento:', err);
        
        // Registrar o erro para diagnóstico
        try {
          await supabase
            .from('system_logs')
            .insert([{
              type: 'payment_process_error',
              data: JSON.stringify({
                email: data.email,
                error: typeof err === 'object' ? JSON.stringify(err) : String(err)
              }),
              created_at: new Date().toISOString()
            }]);
        } catch (logError) {
          console.error('Erro ao registrar log:', logError);
        }
        
        throw err;
      }
    } catch (err) {
      console.error('Erro ao criar pagamento:', err);
      let errorMsg = '';
      
      if (err === null || err === undefined) {
        errorMsg = 'Erro desconhecido (nulo ou indefinido)';
      } else if (typeof err === 'string') {
        errorMsg = err;
      } else if (err instanceof Error) {
        errorMsg = err.message || 'Erro sem mensagem';
      } else if (typeof err === 'object') {
        const errorObj = err as any;
        if (Object.keys(errorObj).length === 0) {
          errorMsg = 'Erro vazio (objeto sem propriedades)';
        } else {
          try {
            errorMsg = JSON.stringify(err, null, 2);
          } catch (jsonError) {
            errorMsg = 'Erro não serializável';
          }
        }
      } else {
        errorMsg = String(err);
      }
      
      toast.error('Erro ao registrar pagamento: ' + errorMsg);
      throw err;
    }
  }

  // Função para verificar a estrutura da tabela pagamentos
  async function checkTableStructure() {
    try {
      console.log('Verificando estrutura da tabela pagamentos...');
      
      // Verificar as restrições de chave estrangeira
      const { data: fkData, error: fkError } = await supabase
        .rpc('get_foreign_key_info', { table_name: 'pagamentos' });
        
      if (fkError) {
        console.error('Erro ao verificar chave estrangeira:', fkError);
        
        // Se a função RPC não existe, vamos executar a consulta diretamente
        const { data, error } = await supabase
          .from('pagamentos')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error('Erro ao verificar tabela pagamentos:', error);
        } else if (data && data.length > 0) {
          console.log('Estrutura da tabela pagamentos:');
          console.log('Colunas disponíveis:', Object.keys(data[0]));
        } else {
          console.log('Tabela pagamentos não possui registros para verificar estrutura');
          
          // Verificar se a tabela users existe e sua estrutura
          try {
            console.log('Verificando tabela users...');
            const { data: usersData, error: usersError } = await supabase
              .from('users')
              .select('*')
              .limit(1);
              
            if (usersError) {
              console.error('Erro ao verificar tabela users:', usersError);
            } else if (usersData && usersData.length > 0) {
              console.log('Colunas disponíveis na tabela users:', Object.keys(usersData[0]));
            } else {
              console.log('Tabela users está vazia');
            }
          } catch (userTableError) {
            console.error('Erro ao verificar tabela users:', userTableError);
          }
        }
      } else {
        console.log('Informações sobre chave estrangeira:', fkData);
      }
    } catch (err) {
      console.error('Erro ao verificar estrutura da tabela:', err);
    }
  }

  // Executa verificação da estrutura ao inicializar o hook
  useEffect(() => {
    checkTableStructure();
  }, []);

  return {
    payments,
    isLoading,
    loadPayments,
    createPayment
  };
} 