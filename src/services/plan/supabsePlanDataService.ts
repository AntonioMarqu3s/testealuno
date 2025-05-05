import { supabase } from '@/lib/supabase';
import { PlanType, UserPlan } from './planTypes';

/**
 * Get user plan from Supabase
 */
export const getUserPlanFromSupabase = async (userId: string): Promise<UserPlan | null> => {
  const { data, error } = await supabase
    .from('user_plans')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user plan from Supabase:', error);
    return null;
  }

  if (!data) return null;

  return {
    plan: data.plan as PlanType,
    name: data.name,
    agentLimit: data.agent_limit,
    trialEndsAt: data.trial_ends_at,
    paymentDate: data.payment_date,
    subscriptionEndsAt: data.subscription_ends_at,
    paymentStatus: data.payment_status,
    connectInstancia: data.connect_instancia,
    updatedAt: data.updated_at
  };
};

/**
 * Save user plan to Supabase
 */
export const saveUserPlanToSupabase = async (
  userId: string, 
  plan: PlanType, 
  name: string, 
  agentLimit: number, 
  trialEndsAt?: string,
  paymentDate?: string,
  subscriptionEndsAt?: string,
  paymentStatus?: string,
  connectInstancia?: boolean
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_plans')
    .upsert([{
      user_id: userId,
      plan,
      name,
      agent_limit: agentLimit,
      trial_ends_at: trialEndsAt,
      payment_date: paymentDate,
      subscription_ends_at: subscriptionEndsAt,
      payment_status: paymentStatus,
      connect_instancia: connectInstancia,
      updated_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error saving user plan to Supabase:', error);
    return false;
  }

  return true;
};

/**
 * Buscar todos os planos da tabela 'planos' do Supabase
 */
export const getAllPlansFromSupabase = async () => {
  console.log('Buscando planos do Supabase (tabela plans)...');
  
  try {
    // Verificar a estrutura da tabela plans para diagnóstico
    const { data: planStructure, error: structureError } = await supabase
      .from('plans')
      .select('*')
      .limit(1);
      
    if (structureError) {
      console.error('Erro ao verificar estrutura da tabela plans:', structureError);
    } else if (planStructure && planStructure.length > 0) {
      console.log('Estrutura da tabela plans:', Object.keys(planStructure[0]));
    }
    
    // Consultando a tabela plans ao invés de planos
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('type', { ascending: true });

    if (error) {
      console.error('Erro ao buscar planos na tabela plans:', error);
      
      // Tentativa de fallback para tabela planos
      console.log('Tentando fallback para tabela planos...');
      const fallbackResult = await supabase
        .from('planos')
        .select('*')
        .order('id', { ascending: true });
        
      if (fallbackResult.error) {
        console.error('Erro ao buscar planos na tabela planos (fallback):', fallbackResult.error);
        console.log('Criando planos de fallback como último recurso...');
        const fallbackPlans = createFallbackPlans();
        console.log('Planos de fallback criados:', fallbackPlans);
        return fallbackPlans;
      }
      
      console.log(`Planos encontrados na tabela planos (fallback): ${fallbackResult.data?.length || 0}`);
      return fallbackResult.data || createFallbackPlans();
    }

    console.log(`Planos encontrados na tabela plans: ${data?.length || 0}`);
    
    // Se não encontrou planos, retorna dados mockados como fallback
    if (!data || data.length === 0) {
      console.log('Sem planos encontrados. Usando planos padrão...');
      return createFallbackPlans();
    }
    
    // Log de depuração para ver a estrutura dos planos
    console.log('Estrutura do primeiro plano:', data[0]);
    
    return data;
  } catch (e) {
    console.error('Exceção ao buscar planos:', e);
    return createFallbackPlans();
  }
};

// Função para criar planos fallback se não for possível carregar do banco
function createFallbackPlans() {
  console.log('Usando planos fallback');
  
  // Tentativa de criar os planos dinamicamente no banco
  try {
    const createPlansSql = `
      CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        type INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        agent_limit INTEGER,
        trial_days INTEGER
      );
      
      -- Inserir planos padrão se a tabela estiver vazia
      INSERT INTO plans (type, name, description, price, agent_limit, trial_days)
      SELECT 0, 'Teste Gratuito', 'Acesso limitado para avaliação do sistema', 0, 1, 5
      WHERE NOT EXISTS (SELECT 1 FROM plans WHERE type = 0);
      
      INSERT INTO plans (type, name, description, price, agent_limit, trial_days)
      SELECT 1, 'Inicial', 'Plano básico para pequenas necessidades', 99.90, 1, null
      WHERE NOT EXISTS (SELECT 1 FROM plans WHERE type = 1);
      
      INSERT INTO plans (type, name, description, price, agent_limit, trial_days)
      SELECT 2, 'Padrão', 'Plano ideal para a maioria dos usuários', 199.90, 3, null
      WHERE NOT EXISTS (SELECT 1 FROM plans WHERE type = 2);
      
      INSERT INTO plans (type, name, description, price, agent_limit, trial_days)
      SELECT 3, 'Premium', 'Acesso completo com recursos ilimitados', 499.90, 10, null
      WHERE NOT EXISTS (SELECT 1 FROM plans WHERE type = 3);
    `;
    
    // Executar o SQL para criar a tabela e inserir os planos padrão
    // Vamos criar uma função autoexecutável assíncrona para lidar com isso
    (async function createDefaultPlans() {
      try {
        const result = await supabase.rpc('exec_sql', { sql: createPlansSql });
        console.log('Tentativa de criar planos padrão:', result);
      } catch (err) {
        console.error('Erro ao criar planos padrão:', err);
      }
    })();
  } catch (err) {
    console.error('Erro ao tentar criar planos no banco:', err);
  }
  
  // Retornar planos padrão de qualquer forma como fallback
  return [
    {
      id: '1',
      type: 0,
      name: 'Teste Gratuito',
      description: 'Acesso limitado para avaliação do sistema',
      price: 0,
      agent_limit: 1,
      trial_days: 5
    },
    {
      id: '2',
      type: 1,
      name: 'Inicial',
      description: 'Plano básico para pequenas necessidades',
      price: 99.90,
      agent_limit: 1,
      trial_days: null
    },
    {
      id: '3',
      type: 2,
      name: 'Padrão',
      description: 'Plano ideal para a maioria dos usuários',
      price: 199.90,
      agent_limit: 3,
      trial_days: null
    },
    {
      id: '4',
      type: 3,
      name: 'Premium',
      description: 'Acesso completo com recursos ilimitados',
      price: 499.90,
      agent_limit: 10,
      trial_days: null
    }
  ];
}
