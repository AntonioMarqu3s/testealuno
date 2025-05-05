import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Verify the user making the request is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Unauthorized')
    }
    
    // Verificar se o usuário é admin master na tabela 'users'
    const { data: adminCheck, error: adminCheckError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single()
      
    if (adminCheckError) {
      throw new Error('Error checking admin status')
    }
    
    if (!adminCheck || adminCheck.admin_level !== 'master') {
      throw new Error('Only master admins can create other admins')
    }

    // Parse request data
    const { email, password, adminLevel = 'standard' } = await req.json()
    
    if (!email || !password) {
      throw new Error('Email and password are required')
    }
    
    if (adminLevel !== 'master' && adminLevel !== 'standard') {
      throw new Error('Invalid admin level. Must be "master" or "standard"')
    }
    
    // Create the user with specific metadata
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', adminLevel }
    })
    
    if (createError) {
      throw createError
    }
    
    if (!newUser.user) {
      throw new Error('Failed to create user')
    }
    
    // Adicionar usuário na tabela 'users' (já criado no auth)
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({
        email: email,
        admin_level: adminLevel,
        role: 'admin'
      })
      .eq('id', newUser.user.id)
    
    if (updateError) {
      // Se falhar, deletar usuário criado no auth
      await supabaseClient.auth.admin.deleteUser(newUser.user.id)
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin created successfully',
        userId: newUser.user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error creating admin:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }),
      { 
        status: error.message.includes('Unauthorized') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
