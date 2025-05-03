
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

    // Admin credentials - fixed for simplicity
    const adminEmail = 'admin@example.com'
    const adminPassword = '@admin123456'

    // Check if an administrator already exists
    const { data: adminUsers, error: queryError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('email', adminEmail)
      .limit(1)
    
    if (queryError) {
      console.error('Error checking existing administrators:', queryError)
      throw queryError
    }
    
    // If admin already exists, return success with credentials
    if (adminUsers && adminUsers.length > 0) {
      console.log('Administrator already exists')
      return new Response(JSON.stringify({
        success: true,
        message: 'Administrator already exists',
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Try to get the user by email first
    const { data: { users }, error: getUserError } = await supabaseClient.auth.admin.listUsers();
    
    let adminUser = users?.find(user => user.email === adminEmail);
    
    if (getUserError) {
      console.error('Error checking existing users:', getUserError)
    }
    
    // If user doesn't exist, create it
    if (!adminUser) {
      console.log('Creating new admin user:', adminEmail);
      const { data: userData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
      });

      if (authError) {
        console.error('Error creating admin user:', authError)
        throw authError
      }

      if (!userData.user) {
        throw new Error('Failed to create administrative user')
      }
      
      adminUser = userData.user;
      console.log('User created successfully:', adminUser.id);
    } else {
      console.log('Admin user already exists, updating password');
      // Update password for existing user
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        adminUser.id,
        { password: adminPassword, email_confirm: true }
      );
      
      if (updateError) {
        console.error('Error updating admin password:', updateError);
        throw updateError;
      }
    }

    // Add user to admin_users table if not already there
    const { data: existingAdminRecord, error: checkAdminError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('user_id', adminUser.id)
      .maybeSingle();
    
    if (checkAdminError) {
      console.error('Error checking admin record:', checkAdminError);
      throw checkAdminError;
    }
    
    if (!existingAdminRecord) {
      console.log('Adding user to admin_users table:', adminUser.id);
      const { error: adminError } = await supabaseClient
        .from('admin_users')
        .insert({
          user_id: adminUser.id,
          email: adminEmail
        });

      if (adminError) {
        console.error('Error adding user as administrator:', adminError);
        throw adminError;
      }
      
      console.log('User added as administrator successfully');
    } else {
      console.log('Admin record already exists');
    }

    // Return success message
    return new Response(JSON.stringify({
      success: true,
      message: 'Administrator setup completed successfully',
      credentials: {
        email: adminEmail,
        password: adminPassword
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error setting up administrator:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: `Error setting up administrator: ${error.message}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
