
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

    // Parse request body
    const { user_id } = await req.json()
    
    if (!user_id) {
      throw new Error('Missing user_id in request body')
    }
    
    console.log('Checking admin status for user:', user_id)

    // Query admin_users table 
    const { data: adminUser, error: queryError } = await supabaseClient
      .from('admin_users')
      .select('id, admin_level, email')
      .eq('user_id', user_id)
      .single()

    if (queryError) {
      // Log the error but don't expose details to client
      console.error('Database query error:', queryError)
      
      // If it's a not-found error, return false but don't treat it as a system error
      if (queryError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ isAdmin: false }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      throw new Error('Error checking admin status')
    }

    // If found in admin_users, user is an admin
    if (adminUser) {
      console.log('User is an admin with level:', adminUser.admin_level)
      return new Response(
        JSON.stringify({ 
          isAdmin: true, 
          adminId: adminUser.id,
          adminLevel: adminUser.admin_level || 'standard',
          email: adminUser.email
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If not found, user is not an admin
    console.log('User is not an admin')
    return new Response(
      JSON.stringify({ isAdmin: false }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in is_admin_user:', error)
    
    return new Response(
      JSON.stringify({ error: error.message, isAdmin: false }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
