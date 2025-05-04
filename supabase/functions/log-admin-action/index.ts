
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Admin action logging function called");
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the request body
    const { action, performed_by, target_id, details } = await req.json();
    console.log("Received log data:", { action, performed_by, target_id });

    // Validate required fields
    if (!action || !performed_by) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: action and performed_by are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First let's check if the table exists
    const { error: checkError } = await supabaseAdmin
      .from('admin_audit_logs')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.log("Table check error:", checkError.message);
      // Table doesn't exist, so let's create it
      const { error: createTableError } = await supabaseAdmin.rpc('create_admin_audit_logs_if_not_exists');
      
      if (createTableError) {
        console.error("Error creating table:", createTableError);
        return new Response(
          JSON.stringify({ error: createTableError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log("Created admin_audit_logs table");
    }

    // Insert the log entry
    const { data, error } = await supabaseAdmin
      .from('admin_audit_logs')
      .insert([
        { 
          action, 
          performed_by, 
          target_id, 
          details 
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Error logging admin action:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Admin action logged successfully with ID:", data.id);
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
