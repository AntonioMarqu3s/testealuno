
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define types for clarity
type GetEmailsByIdsParams = {
  user_ids: string[]
}

type EmailResult = {
  id: string
  email: string
}

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
    // Initialize Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Parse the request body to get user IDs
    const { user_ids } = await req.json() as GetEmailsByIdsParams
    console.log('Fetching emails for user IDs:', user_ids)
    
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      throw new Error('Invalid input: user_ids must be a non-empty array')
    }

    // Query the auth.users table with the service role to get emails
    const { data, error } = await supabaseClient.auth.admin.listUsers({
      filters: {
        id: user_ids as string[],
      },
    })

    if (error) {
      console.error('Error fetching user emails:', error)
      throw error
    }

    // Format the response
    const formattedData: EmailResult[] = data.users.map(user => ({
      id: user.id,
      email: user.email || 'No email available'
    }))

    console.log(`Found ${formattedData.length} user emails`)

    return new Response(
      JSON.stringify(formattedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in get_emails_by_ids:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
