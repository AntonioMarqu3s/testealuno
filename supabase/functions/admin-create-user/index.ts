
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

    // Parse the request body
    const { email, password, planType } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating user with email: ${email} and planType: ${planType}`);

    // Create the user with the admin client
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      return new Response(
        JSON.stringify({ error: createUserError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log(`User created with ID: ${userId}`);

    // Now create a plan for the user
    const planTypeInt = parseInt(planType.toString());
    let planName = 'Teste Gratuito';
    let agentLimit = 1;
    
    switch (planTypeInt) {
      case 0:
        planName = 'Teste Gratuito';
        agentLimit = 1;
        break;
      case 1:
        planName = 'Inicial';
        agentLimit = 1;
        break;
      case 2:
        planName = 'Padrão';
        agentLimit = 3;
        break;
      case 3:
        planName = 'Premium';
        agentLimit = 10;
        break;
    }

    const now = new Date();
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setDate(now.getDate() + 30);

    const trialEndsAt = planTypeInt === 0 ? 
      new Date(now.getDate() + 5).toISOString() : null;

    const { error: planError } = await supabaseAdmin
      .from('user_plans')
      .insert({
        user_id: userId,
        plan: planTypeInt,
        name: planName,
        agent_limit: agentLimit,
        trial_ends_at: trialEndsAt,
        subscription_ends_at: planTypeInt === 0 ? null : subscriptionEndsAt.toISOString(),
        payment_date: planTypeInt === 0 ? null : now.toISOString(),
        payment_status: planTypeInt === 0 ? 'pending' : 'completed',
        updated_at: now.toISOString()
      });

    if (planError) {
      console.error('Error creating user plan:', planError);
      return new Response(
        JSON.stringify({ error: planError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: userData.user }),
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
