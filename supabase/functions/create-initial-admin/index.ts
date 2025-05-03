
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // CORS configuration
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if an administrator already exists
    const { data: adminUsers, error: queryError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .limit(1)
    
    if (queryError) {
      console.error('Error checking existing administrators:', queryError)
      throw queryError
    }
    
    // If admin already exists, return message
    if (adminUsers && adminUsers.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'An administrator already exists'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Admin credentials
    const adminEmail = 'admin@example.com'
    const adminPassword = '@admin123456' // As requested by the client

    // Create user in auth with confirmed email
    const { data: userData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true // Automatically confirm email
    })

    if (authError) {
      console.error('Error creating admin user:', authError)
      throw authError
    }

    if (!userData.user) {
      throw new Error('Failed to create administrative user')
    }

    console.log('User created successfully:', userData.user)

    // Add user to admin_users table
    const { error: adminError } = await supabaseClient
      .from('admin_users')
      .insert({
        user_id: userData.user.id,
        email: adminEmail // Store email for quick reference
      })

    if (adminError) {
      console.error('Error adding user as administrator:', adminError)
      // Try to delete the created user to avoid inconsistencies
      await supabaseClient.auth.admin.deleteUser(userData.user.id)
      throw adminError
    }

    // Return success message
    return new Response(JSON.stringify({
      success: true,
      message: 'Administrator created successfully',
      credentials: {
        email: adminEmail,
        password: adminPassword
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error creating administrator:', error)
    
    return new Response(JSON.stringify({
      success: false,
      message: `Error creating administrator: ${error.message}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
