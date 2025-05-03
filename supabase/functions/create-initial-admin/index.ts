
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
    console.log("Starting create-initial-admin function");
    
    // Initialize Supabase client using environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Admin credentials - fixed for simplicity
    const adminEmail = 'admin@example.com'
    const adminPassword = '@admin123456'

    // Check if the user exists first
    const { data: { users }, error: getUserError } = await supabaseClient.auth.admin.listUsers();
    
    let adminUser = users?.find(user => user.email === adminEmail);
    
    if (getUserError) {
      console.error('Error checking existing users:', getUserError);
      throw getUserError;
    }
    
    // If user doesn't exist, create it
    if (!adminUser) {
      console.log('Creating new admin user:', adminEmail);
      const { data: userData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });

      if (authError) {
        console.error('Error creating admin user:', authError);
        throw authError;
      }

      if (!userData.user) {
        throw new Error('Failed to create administrative user');
      }
      
      adminUser = userData.user;
      console.log('User created successfully:', adminUser.id);
    } else {
      console.log('Admin user already exists, updating password');
      // Update password for existing user
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        adminUser.id,
        { 
          password: adminPassword, 
          email_confirm: true,
          user_metadata: { role: 'admin' }
        }
      );
      
      if (updateError) {
        console.error('Error updating admin password:', updateError);
        throw updateError;
      }
      
      console.log('Admin password updated successfully');
    }

    // Add user to admin_users table directly with SQL to bypass RLS policies
    const { error: adminTableError } = await supabaseClient
      .from('admin_users')
      .upsert({
        user_id: adminUser.id,
        email: adminEmail
      }, {
        onConflict: 'user_id'
      });
    
    if (adminTableError) {
      console.error('Error updating admin_users table:', adminTableError);
      
      // Try a direct SQL approach if RLS is causing issues
      const { error: sqlError } = await supabaseClient.rpc('add_admin_user', {
        admin_user_id: adminUser.id,
        admin_email: adminEmail
      });
      
      if (sqlError) {
        console.error('Error with RPC call:', sqlError);
        throw sqlError;
      }
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
