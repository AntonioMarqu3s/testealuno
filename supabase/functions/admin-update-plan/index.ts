
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
    const { userId, planType, agentLimit, paymentDate, expirationDate, paymentStatus } = await req.json();

    if (!userId || planType === undefined || agentLimit === undefined) {
      return new Response(
        JSON.stringify({ error: 'userId, planType, and agentLimit are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Updating plan for user: ${userId} to planType: ${planType} with agentLimit: ${agentLimit}`);

    // Get the plan name based on the planType
    let planName = 'Teste Gratuito';
    
    switch (planType) {
      case 0:
        planName = 'Teste Gratuito';
        break;
      case 1:
        planName = 'Inicial';
        break;
      case 2:
        planName = 'Padrão';
        break;
      case 3:
        planName = 'Premium';
        break;
    }

    const now = new Date();
    
    // Prepare the update data
    const updateData: any = {
      plan: planType,
      name: planName,
      agent_limit: agentLimit,
      updated_at: now.toISOString()
    };

    // Add optional fields if provided
    if (paymentDate) {
      updateData.payment_date = new Date(paymentDate).toISOString();
    }

    if (expirationDate) {
      updateData.subscription_ends_at = new Date(expirationDate).toISOString();
    }

    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    // If it's a trial plan, set trial_ends_at
    if (planType === 0) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(now.getDate() + 5);
      updateData.trial_ends_at = trialEndsAt.toISOString();
    } else {
      updateData.trial_ends_at = null;
    }

    // Check if user has a plan already
    const { data: existingPlan, error: queryError } = await supabaseAdmin
      .from('user_plans')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (queryError) {
      console.error('Error checking existing plan:', queryError);
      return new Response(
        JSON.stringify({ error: queryError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let error;
    if (existingPlan) {
      // Update existing plan
      const { error: updateError } = await supabaseAdmin
        .from('user_plans')
        .update(updateData)
        .eq('user_id', userId);
      
      error = updateError;
    } else {
      // Create new plan
      updateData.user_id = userId;
      const { error: insertError } = await supabaseAdmin
        .from('user_plans')
        .insert([updateData]);
      
      error = insertError;
    }

    if (error) {
      console.error('Error updating user plan:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
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
