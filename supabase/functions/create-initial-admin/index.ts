
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }
}

// Handler for the function
Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Create Supabase client using Supabase service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Create initial admin user
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123456';
    
    // Check if the user already exists
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers({
      filter: `email eq '${adminEmail}'`
    });
    
    let userId;
    
    if (checkError) {
      throw new Error(`Error checking for existing user: ${checkError.message}`);
    }
    
    if (existingUsers && existingUsers.users.length > 0) {
      // User already exists, use their ID
      userId = existingUsers.users[0].id;
      console.log(`Admin user already exists: ${userId}`);
    } else {
      // Create new user
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });
      
      if (createError) {
        throw new Error(`Error creating user: ${createError.message}`);
      }
      
      userId = userData.user.id;
      console.log(`Created new admin user: ${userId}`);
    }
    
    // Check if this user is already in admin_users table
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (adminCheckError && adminCheckError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw new Error(`Error checking admin status: ${adminCheckError.message}`);
    }
    
    if (!existingAdmin) {
      // Add user to admin_users table
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert([{ user_id: userId }]);
        
      if (insertError) {
        throw new Error(`Error setting admin privileges: ${insertError.message}`);
      }
      
      console.log(`Added user to admin_users: ${userId}`);
    } else {
      console.log(`User already has admin privileges: ${userId}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: "Initial admin user created successfully",
      credentials: {
        email: adminEmail,
        password: "admin123456 (change this after first login)"
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
