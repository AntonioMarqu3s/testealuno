-- Adiciona campos para suporte a código promocional na tabela pagamentos
ALTER TABLE IF EXISTS public.pagamentos
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS is_promo_applied BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS data_expiracao TIMESTAMP WITH TIME ZONE;

-- Adiciona os mesmos campos na tabela temp_pagamentos para manter consistência
ALTER TABLE IF EXISTS public.temp_pagamentos
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS is_promo_applied BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS data_expiracao TIMESTAMP WITH TIME ZONE;

-- Atualiza a função de registro de pagamento para incluir esses campos
CREATE OR REPLACE FUNCTION public.registrar_pagamento(
  p_email TEXT,
  p_plano_id INTEGER,
  p_valor NUMERIC,
  p_data_pagamento TIMESTAMP WITH TIME ZONE,
  p_data_expiracao TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_promo_code TEXT DEFAULT NULL,
  p_is_promo_applied BOOLEAN DEFAULT FALSE,
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
      data_pagamento,
      data_expiracao,
      promo_code,
      is_promo_applied
    ) VALUES (
      v_user_id,
      p_plano_id,
      p_valor,
      p_status,
      p_data_pagamento,
      p_data_expiracao,
      p_promo_code,
      p_is_promo_applied
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