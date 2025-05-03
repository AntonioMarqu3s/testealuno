
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Configuração CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Inicializa o cliente Supabase usando variáveis de ambiente
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verifica se já existe um administrador
    const { data: adminUsers, error: queryError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .limit(1)
    
    if (queryError) {
      console.error('Erro ao verificar administradores existentes:', queryError)
      throw queryError
    }
    
    if (adminUsers && adminUsers.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Um administrador já foi criado anteriormente'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Cria um email e senha para o administrador
    const adminEmail = 'admin@example.com'
    const adminPassword = 'admin123456' // Será solicitada alteração no primeiro login

    // Cria o usuário no auth
    const { data: userData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true // Confirma o email automaticamente
    })

    if (authError) {
      console.error('Erro ao criar usuário administrador:', authError)
      throw authError
    }

    if (!userData.user) {
      throw new Error('Falha ao criar usuário administrativo')
    }

    // Adiciona o usuário à tabela de administradores
    const { error: adminError } = await supabaseClient
      .from('admin_users')
      .insert({
        user_id: userData.user.id
      })

    if (adminError) {
      console.error('Erro ao adicionar usuário como administrador:', adminError)
      // Tenta remover o usuário criado para evitar inconsistências
      await supabaseClient.auth.admin.deleteUser(userData.user.id)
      throw adminError
    }

    // Retorna as credenciais criadas
    return new Response(JSON.stringify({
      success: true,
      message: 'Administrador inicial criado com sucesso',
      credentials: {
        email: adminEmail,
        password: adminPassword + ' (change this after first login)'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Erro ao criar administrador inicial:', error)
    
    return new Response(JSON.stringify({
      success: false,
      message: `Erro ao criar administrador inicial: ${error.message}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
