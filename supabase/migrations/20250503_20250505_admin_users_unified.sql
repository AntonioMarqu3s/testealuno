-- Unificação das migrações relacionadas à tabela admin_users

-- Criação da tabela admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  admin_level TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Índice para o campo email
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- Habilitar RLS para admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin_users
DROP POLICY IF EXISTS "Admin users can read all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can insert new admin users" ON public.admin_users;

CREATE POLICY "Allow admin to see admin users"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admin to update own record"
  ON public.admin_users
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Allow insert through function"
  ON public.admin_users
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role bypass policy"
  ON public.admin_users
  USING (true)
  WITH CHECK (true);

-- Drop functions if exist to avoid conflicts
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_admin_user(UUID);

-- Função para verificar se usuário é admin (versão simples)
CREATE OR REPLACE FUNCTION public.is_admin(checking_user_id UUID) 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = checking_user_id
  );
END;
$$;

-- Função para verificar se usuário é admin (versão tabela)
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS TABLE (
  is_admin BOOLEAN,
  admin_level TEXT,
  admin_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as is_admin,
    au.admin_level,
    au.id as admin_id
  FROM public.admin_users au
  WHERE au.user_id = is_admin_user.user_id;
END;
$$;

-- Função para adicionar admin users
CREATE OR REPLACE FUNCTION public.add_admin_user(admin_user_id UUID, admin_email TEXT, admin_level TEXT DEFAULT 'standard')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_admin_id UUID;
BEGIN
  INSERT INTO public.admin_users (user_id, email, admin_level) 
  VALUES (admin_user_id, admin_email, admin_level)
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$;

-- Atualizar admin inicial para master (exemplo)
DO $$ 
BEGIN
  UPDATE public.admin_users
  SET admin_level = 'master'
  WHERE email = 'admin@example.com' OR user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
  );
END $$;
