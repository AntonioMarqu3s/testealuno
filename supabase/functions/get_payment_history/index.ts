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
    
    // Buscar histórico de pagamentos na tabela 'pagamentos'
    const { data, error } = await supabaseClient
      .from('pagamentos')
      .select('*')
      .eq('user_id', userId)
      .order('data_pagamento', { ascending: false });
    if (error) throw error;
    return new Response(JSON.stringify(data), { headers: corsHeaders });
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
