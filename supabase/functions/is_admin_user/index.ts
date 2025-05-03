
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Get request body or query params
    let userId;
    
    // Handle both POST with body and GET with query params
    if (req.method === 'POST') {
      const body = await req.json();
      userId = body.user_id;
      console.log("Received user_id in POST body:", userId);
    } else {
      const url = new URL(req.url);
      userId = url.searchParams.get('user_id');
      console.log("Received user_id in query params:", userId);
    }
    
    if (!userId) {
      console.error("No user_id provided in request");
      throw new Error('User ID is required');
    }

    // Direct SQL query to avoid RLS issues
    const { data, error } = await supabaseClient.rpc(
      'is_admin_user',
      { user_id: userId }
    );

    if (error) {
      console.error("RPC error:", error);
      throw error;
    }

    console.log("Admin check result:", data);

    // Return admin info if found
    return new Response(
      JSON.stringify({
        isAdmin: Boolean(data && data.length > 0),
        adminLevel: data && data.length > 0 ? data[0].admin_level : null,
        adminId: data && data.length > 0 ? data[0].admin_id : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking admin status:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
})
