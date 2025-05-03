
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
      console.log('Missing Authorization header')
      throw new Error('Missing Authorization header')
    }

    // Get request body
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Verify the user making the request is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: requester }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !requester) {
      throw new Error('Unauthorized')
    }
    
    // Check if the requester is an admin
    const { data: isAdminData, error: adminCheckError } = await supabaseClient.rpc('is_admin', {
      checking_user_id: requester.id
    })
    
    if (adminCheckError || !isAdminData) {
      throw new Error('Unauthorized: Only admins can view user details')
    }

    // Fetch the requested user's data
    const { data: userData, error: userDataError } = await supabaseClient.auth.admin.getUserById(userId)
    
    if (userDataError || !userData) {
      throw new Error(`User not found: ${userDataError?.message || 'Unknown error'}`)
    }
    
    // Fetch the user's plan data
    const { data: planData, error: planError } = await supabaseClient
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (planError && planError.code !== 'PGRST116') {
      console.error('Error fetching user plan:', planError)
    }

    // Return the combined user data
    return new Response(
      JSON.stringify({
        ...userData,
        plan: planData || null
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-user-details:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: error.message.includes('Unauthorized') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
