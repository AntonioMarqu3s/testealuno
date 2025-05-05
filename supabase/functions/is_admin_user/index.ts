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
    const { userId } = await req.json()
    
    if (!userId) {
      throw new Error('Missing userId in request body')
    }
    
    console.log('Checking admin status for user:', userId)

    // Query users table (nova)
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('role', 'admin')
      .single()

    if (error) throw error;
    if (data && (data.admin_level === 'master' || data.admin_level === 'standard')) {
      console.log('User is an admin with level:', data.admin_level)
      return new Response(
        JSON.stringify({ 
          isAdmin: true, 
          adminId: data.id,
          adminLevel: data.admin_level || 'standard',
          email: data.email
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
