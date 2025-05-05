
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

    // Parse request body
    const { userEmail } = await req.json()
    
    if (!userEmail) {
      throw new Error('Missing userEmail in request body')
    }
    
    console.log('Searching payment history for email:', userEmail)

    // First, find the user ID for the given email
    const { data: userData, error: userError } = await supabaseClient
      .rpc('get_user_by_email', { p_email: userEmail })
      .maybeSingle();
      
    if (userError) {
      console.error('Error finding user:', userError.message);
      throw new Error(`Error finding user: ${userError.message}`);
    }
    
    // If user not found, return empty result
    if (!userData) {
      return new Response(
        JSON.stringify({ payments: [] }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = userData.id;
    console.log('Found user ID:', userId);
    
    // Now fetch payment history for the user
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('user_plans')
      .select('id, name, plan, agent_limit, payment_date, subscription_ends_at, payment_status')
      .eq('user_id', userId)
      .order('payment_date', { ascending: false });
      
    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError.message);
      throw new Error(`Error fetching payment history: ${paymentsError.message}`);
    }
    
    console.log(`Found ${payments?.length || 0} payment records`);
    
    // Format the payment data
    const formattedPayments = payments?.map(payment => ({
      id: payment.id,
      userEmail: userEmail,
      planName: payment.name || 'Plano Padrão',
      amount: getPlanAmount(payment.plan),
      paymentDate: payment.payment_date,
      expirationDate: payment.subscription_ends_at,
      status: payment.payment_status || 'pending'
    })) || [];

    return new Response(
      JSON.stringify({ payments: formattedPayments }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get_payment_history:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: error.message.includes('Unauthorized') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper function to get amount based on plan type
function getPlanAmount(planType: number): number {
  switch (planType) {
    case 1:
      return 97.00;
    case 2:
      return 210.00;
    case 3:
      return 700.00;
    default:
      return 97.00;
  }
}
