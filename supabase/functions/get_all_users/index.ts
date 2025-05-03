
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

    // Verify the user making the request is an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Verify user is an admin
    const { data: adminCheck, error: adminError } = await supabaseClient.rpc('is_admin_user', { 
      user_id: user.id 
    })
    
    if (adminError || !adminCheck || adminCheck.length === 0) {
      throw new Error('Unauthorized: User is not an admin')
    }

    // Get all users from auth.users using service role
    const { data: authUsers, error: authUsersError } = await supabaseClient.auth.admin.listUsers()
    
    if (authUsersError) {
      throw new Error(`Error fetching users: ${authUsersError.message}`)
    }

    // Format the users data for the client
    const formattedUsers = authUsers.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      isActive: user.last_sign_in_at !== null
    }))

    return new Response(
      JSON.stringify(formattedUsers), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: error.message.includes('Unauthorized') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
