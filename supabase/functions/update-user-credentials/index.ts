
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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    // Extract auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }
    
    // Verify the token belongs to an admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      throw new Error('Unauthorized access')
    }
    
    // Check if user is an admin
    const { data: adminData, error: adminError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (adminError || !adminData) {
      throw new Error('User is not an admin')
    }
    
    // Get request data
    const { userId, email, password } = await req.json()
    
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    // Update credentials
    const updates = {}
    
    if (email) {
      const { error: updateEmailError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { email }
      )
      
      if (updateEmailError) {
        throw updateEmailError
      }
    }
    
    if (password) {
      const { error: updatePasswordError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { password }
      )
      
      if (updatePasswordError) {
        throw updatePasswordError
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User credentials updated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error updating user credentials:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Error updating user credentials: ${error.message}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
