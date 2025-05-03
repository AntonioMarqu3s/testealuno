
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This function checks if a user is an admin and returns their admin level
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
    const { user_id } = await req.json()
    
    if (!user_id) {
      throw new Error('User ID is required')
    }
    
    // Initialize Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    // Check if user exists in admin_users table
    const { data, error } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('user_id', user_id)
      .single()
    
    if (error) {
      console.error('Error checking admin status:', error)
      return new Response(
        JSON.stringify({ isAdmin: false, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        isAdmin: !!data,
        adminLevel: data?.admin_level || 'standard', 
        adminId: data?.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in is_admin_user function:', error)
    return new Response(
      JSON.stringify({ isAdmin: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
