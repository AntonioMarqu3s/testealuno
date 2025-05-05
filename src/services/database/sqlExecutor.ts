import { supabase } from '@/lib/supabase';

/**
 * Executa SQL diretamente no banco de dados
 * Esta função deve ser usada com extremo cuidado e apenas por administradores
 * @param sql Comando SQL a ser executado
 * @returns Resultado da execução
 */
export const executeSql = async (sql: string) => {
  try {
    // Verificar se existe a função exec_sql no Supabase
    const { data: functionExists, error: functionCheckError } = await supabase.rpc(
      'function_exists',
      { function_name: 'exec_sql' }
    );

    // Se não conseguir verificar, assumimos que não existe
    if (functionCheckError || !functionExists) {
      console.log('Criando função exec_sql no Supabase...');
      
      // Primeiro criamos uma função para verificar se outras funções existem
      const createFunctionExistsFunction = `
        CREATE OR REPLACE FUNCTION public.function_exists(function_name text)
        RETURNS boolean
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          exists_bool BOOLEAN;
        BEGIN
          SELECT EXISTS (
            SELECT 1
            FROM pg_proc
            WHERE proname = function_name
          ) INTO exists_bool;
          
          RETURN exists_bool;
        END;
        $$;
      `;
      
      // Usar o serviço REST diretamente para criar a função
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`
        },
        body: JSON.stringify({ command: createFunctionExistsFunction })
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao criar função function_exists: ${await response.text()}`);
      }
      
      // Agora criamos a função exec_sql
      const createExecSqlFunction = `
        CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
        RETURNS json
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result json;
        BEGIN
          EXECUTE sql;
          result := json_build_object('success', true);
          RETURN result;
        EXCEPTION WHEN OTHERS THEN
          result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'detail', SQLSTATE
          );
          RETURN result;
        END;
        $$;
      `;
      
      const execSqlResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`
        },
        body: JSON.stringify({ command: createExecSqlFunction })
      });
      
      if (!execSqlResponse.ok) {
        throw new Error(`Falha ao criar função exec_sql: ${await execSqlResponse.text()}`);
      }
    }
    
    // Agora podemos executar o SQL usando a função exec_sql
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Erro ao executar SQL:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Erro ao executar SQL:', err);
    throw err;
  }
};

/**
 * Cria uma função SQL para registrar pagamentos
 * @returns Resultado da criação da função
 */
export const createPaymentRegistrationFunction = async () => {
  // Primeiro verificamos qual tabela é referenciada pela chave estrangeira
  const checkTableStructureSql = `
    SELECT
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM
      information_schema.table_constraints AS tc
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE
      tc.table_name = 'pagamentos'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'pagamentos_user_id_fkey';
  `;
  
  try {
    // Executar a consulta para verificar a estrutura da chave estrangeira
    await executeSql(checkTableStructureSql);
    
    // Criar a função registrar_pagamento
    const sql = `
      CREATE OR REPLACE FUNCTION public.registrar_pagamento(
        p_email TEXT,
        p_plano_id INTEGER,
        p_valor NUMERIC,
        p_data_pagamento TIMESTAMP WITH TIME ZONE,
        p_status TEXT DEFAULT 'completed'
      ) 
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        v_user_id UUID;
        v_payment_id UUID;
        v_result JSONB;
        v_foreign_table TEXT;
        v_found BOOLEAN := FALSE;
      BEGIN
        -- Primeiro verificar qual tabela é referenciada pela chave estrangeira
        SELECT ccu.table_name INTO v_foreign_table
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'pagamentos'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND tc.constraint_name = 'pagamentos_user_id_fkey';
          
        RAISE NOTICE 'Tabela referenciada pela chave estrangeira: %', v_foreign_table;
          
        -- Verificar se o email existe em auth.users
        IF NOT v_found THEN
          SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
          IF v_user_id IS NOT NULL THEN
            v_found := TRUE;
            RAISE NOTICE 'Usuário encontrado em auth.users: %', v_user_id;
          END IF;
        END IF;
        
        -- Verificar se o email existe em profiles
        IF NOT v_found THEN
          SELECT id INTO v_user_id FROM profiles WHERE email = p_email;
          IF v_user_id IS NOT NULL THEN
            v_found := TRUE;
            RAISE NOTICE 'Usuário encontrado em profiles: %', v_user_id;
          END IF;
        END IF;
        
        -- Verificar se o email existe em users
        IF NOT v_found THEN
          SELECT id INTO v_user_id FROM users WHERE email = p_email;
          IF v_user_id IS NOT NULL THEN
            v_found := TRUE;
            RAISE NOTICE 'Usuário encontrado em users: %', v_user_id;
          END IF;
        END IF;
        
        -- Se não encontrou em nenhuma tabela, retornar erro
        IF NOT v_found THEN
          RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Usuário não encontrado com o email: ' || p_email,
            'foreign_table', v_foreign_table
          );
        END IF;
        
        -- Verificar se o ID existe na tabela referenciada pela chave estrangeira
        IF v_foreign_table IS NOT NULL THEN
          EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE id = $1)', v_foreign_table)
          INTO v_found
          USING v_user_id;
          
          IF NOT v_found THEN
            RAISE NOTICE 'ID % não existe na tabela % referenciada pela chave estrangeira', v_user_id, v_foreign_table;
            RETURN jsonb_build_object(
              'success', FALSE,
              'error', 'ID ' || v_user_id || ' não existe na tabela ' || v_foreign_table || ' referenciada pela chave estrangeira',
              'foreign_table', v_foreign_table
            );
          END IF;
        END IF;
        
        -- Inserir o pagamento
        BEGIN
          INSERT INTO pagamentos (
            user_id, 
            plano_id, 
            valor, 
            status, 
            data_pagamento
          ) VALUES (
            v_user_id,
            p_plano_id,
            p_valor,
            p_status,
            p_data_pagamento
          )
          RETURNING id INTO v_payment_id;
        EXCEPTION
          WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao inserir pagamento: % (%)', SQLERRM, SQLSTATE;
            RETURN jsonb_build_object(
              'success', FALSE,
              'error', SQLERRM,
              'detail', SQLSTATE,
              'user_id', v_user_id,
              'foreign_table', v_foreign_table
            );
        END;
        
        RETURN jsonb_build_object(
          'success', TRUE, 
          'payment_id', v_payment_id, 
          'user_id', v_user_id,
          'foreign_table', v_foreign_table
        );
      EXCEPTION
        WHEN OTHERS THEN
          RAISE NOTICE 'Exceção ao processar pagamento: % (%)', SQLERRM, SQLSTATE;
          RETURN jsonb_build_object(
            'success', FALSE,
            'error', SQLERRM,
            'detail', SQLSTATE
          );
      END;
      $$;
    `;
    
    return await executeSql(sql);
  } catch (err) {
    console.error('Erro ao criar função de registro de pagamento:', err);
    throw err;
  }
}; 