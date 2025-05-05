-- Garante que a tabela plans existe
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  agent_limit INTEGER NOT NULL DEFAULT 1,
  trial_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verifica se existem planos, se não, cria os planos padrão
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verifica se a tabela está vazia
  SELECT COUNT(*) INTO v_count FROM public.plans;
  
  -- Se a tabela estiver vazia, insere os planos padrão
  IF v_count = 0 THEN
    -- Teste Gratuito (type 0)
    INSERT INTO public.plans (type, name, description, price, agent_limit, trial_days)
    VALUES (0, 'Teste Gratuito', 'Comece a testar o sistema por 5 dias', 0, 1, 5);
    
    -- Plano Inicial (type 1)
    INSERT INTO public.plans (type, name, description, price, agent_limit, trial_days)
    VALUES (1, 'Inicial', 'Plano básico para pequenas necessidades', 97, 1, NULL);
    
    -- Plano Padrão (type 2)
    INSERT INTO public.plans (type, name, description, price, agent_limit, trial_days)
    VALUES (2, 'Padrão', 'Plano ideal para a maioria dos usuários', 210, 3, NULL);
    
    -- Plano Premium (type 3)
    INSERT INTO public.plans (type, name, description, price, agent_limit, trial_days)
    VALUES (3, 'Premium', 'Acesso completo com recursos avançados', 700, 10, NULL);
    
    RAISE NOTICE 'Planos padrão criados com sucesso.';
  ELSE
    -- Verifica se existe o plano Teste Gratuito (type 0)
    SELECT COUNT(*) INTO v_count FROM public.plans WHERE type = 0;
    IF v_count = 0 THEN
      -- Cria o plano Teste Gratuito
      INSERT INTO public.plans (type, name, description, price, agent_limit, trial_days)
      VALUES (0, 'Teste Gratuito', 'Comece a testar o sistema por 5 dias', 0, 1, 5);
      
      RAISE NOTICE 'Plano Teste Gratuito criado com sucesso.';
    ELSE
      -- Atualiza o plano Teste Gratuito para garantir os dias de teste corretos
      UPDATE public.plans
      SET trial_days = 5,
          name = 'Teste Gratuito',
          description = 'Comece a testar o sistema por 5 dias'
      WHERE type = 0;
      
      RAISE NOTICE 'Plano Teste Gratuito atualizado.';
    END IF;
    
    -- Garante que os outros planos existam e estejam atualizados
    -- Verifica Plano Inicial (type 1)
    SELECT COUNT(*) INTO v_count FROM public.plans WHERE type = 1;
    IF v_count = 0 THEN
      INSERT INTO public.plans (type, name, description, price, agent_limit, trial_days)
      VALUES (1, 'Inicial', 'Plano básico para pequenas necessidades', 97, 1, NULL);
      
      RAISE NOTICE 'Plano Inicial criado.';
    END IF;
    
    -- Verifica Plano Padrão (type 2)
    SELECT COUNT(*) INTO v_count FROM public.plans WHERE type = 2;
    IF v_count = 0 THEN
      INSERT INTO public.plans (type, name, description, price, agent_limit, trial_days)
      VALUES (2, 'Padrão', 'Plano ideal para a maioria dos usuários', 210, 3, NULL);
      
      RAISE NOTICE 'Plano Padrão criado.';
    END IF;
    
    -- Verifica Plano Premium (type 3)
    SELECT COUNT(*) INTO v_count FROM public.plans WHERE type = 3;
    IF v_count = 0 THEN
      INSERT INTO public.plans (type, name, description, price, agent_limit, trial_days)
      VALUES (3, 'Premium', 'Acesso completo com recursos avançados', 700, 10, NULL);
      
      RAISE NOTICE 'Plano Premium criado.';
    END IF;
  END IF;
END $$; 