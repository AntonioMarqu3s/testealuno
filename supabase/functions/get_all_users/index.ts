
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

    // Verify the user making the request is authenticated
    const token = authHeader.replace('Bearer ', '')
    console.log('Verifying user with token:', token.substring(0, 10) + '...')
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.log('User verification failed:', userError?.message || 'No user found')
      throw new Error('Unauthorized')
    }
    
    console.log('User verified:', user.id)

    // Check if the user is an admin using the fixed is_admin function
    console.log('Checking if user is admin')
    
    // Use the database function to check admin status
    const { data: isAdminData, error: adminCheckError } = await supabaseClient.rpc('is_admin', {
      checking_user_id: user.id
    })
    
    if (adminCheckError) {
      console.log('Admin check error:', adminCheckError.message)
      throw new Error(`Unauthorized: Error checking admin status: ${adminCheckError.message}`)
    }
    
    console.log('Admin check result:', isAdminData)
    
    if (!isAdminData) {
      console.log('User is not an admin')
      throw new Error('Unauthorized: User is not an admin')
    }

    // Get all users from auth.users using admin API
    console.log('Fetching all users')
    const { data: authUsers, error: authUsersError } = await supabaseClient.auth.admin.listUsers()
    
    if (authUsersError) {
      console.log('Error fetching users:', authUsersError.message)
      throw new Error(`Error fetching users: ${authUsersError.message}`)
    }
    
    console.log(`Successfully fetched ${authUsers.users.length} users`)

    // Format the users data for the client
    let formattedUsers = authUsers.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      isActive: user.last_sign_in_at !== null,
      metadata: user.user_metadata
    }))

    // Fetch user plans to enrich the data
    console.log('Fetching user plans data')
    const { data: plans, error: plansError } = await supabaseClient
      .from("user_plans")
      .select("*")
      
    if (plansError) {
      console.error("Error fetching user plans:", plansError)
      // Continue without plans data
    } else {
      console.log(`Successfully fetched ${plans?.length || 0} user plans`)
      
      // Map plans to users
      formattedUsers = formattedUsers.map(user => {
        const userPlan = plans?.find(plan => plan.user_id === user.id)
        return {
          ...user,
          plan: userPlan ? {
            name: userPlan.name || "Plano Básico",
            agent_limit: userPlan.agent_limit,
            plan: userPlan.plan,
            payment_date: userPlan.payment_date,
            subscription_ends_at: userPlan.subscription_ends_at,
            payment_status: userPlan.payment_status,
            trial_ends_at: userPlan.trial_ends_at
          } : undefined
        }
      })
    }

    return new Response(
      JSON.stringify(formattedUsers), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get_all_users:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: error.message.includes('Unauthorized') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
