
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Get environment variables or use your actual Supabase project credentials
const supabaseUrl = "https://iaoxaiyjmpqcvbyvlucl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhb3hhaXlqbXBxY3ZieXZsdWNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NzU1NTQsImV4cCI6MjA2MTU1MTU1NH0.BCp61J4kIjjpyTOdshXLMxJvWZ7WEYCoPT9fnWwuc3U";

console.log('🔑 Supabase configuration:');
console.log('URL:', supabaseUrl);
console.log('ANON KEY:', supabaseAnonKey.substring(0, 5) + '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 5));

// Create the Supabase client with retry and timeout options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (url, options) => fetch(url, options)
  }
});

// Test the connection and show alerts as needed but don't block the UI
(async () => {
  try {
    // Simple test to check if the Supabase connection works
    const { data, error } = await supabase.from('agents').select('id').limit(1);
    
    if (error) {
      console.error('⚠️ Supabase connection error:', error);
      // Only show the toast for real errors, not for permission denied
      if (!error.message.includes('permission denied') && !error.message.includes('does not exist')) {
        toast.error('Erro de conexão com o Supabase', {
          description: 'Verifique as credenciais e conexão com a internet.',
          duration: 8000,
        });
      } else {
        console.log('✓ Supabase connected (with expected permission limitation)');
      }
    } else {
      console.log('✅ Supabase connection successful!');
    }
  } catch (err) {
    console.error('❌ Failed to test Supabase connection:', err);
  }
})();

// Types for our database tables
export type Tables = {
  agents: {
    id: string;
    user_id: string;
    name: string;
    type: string;
    is_connected: boolean;
    created_at: string;
    instance_id: string;
    client_identifier?: string;
  };
  profiles: {
    id: string;
    user_id: string;
    email: string;
    updated_at: string;
  };
  user_plans: {
    id: string;
    user_id: string;
    plan: number;
    name: string;
    agent_limit: number;
    trial_ends_at?: string;
    updated_at: string;
  };
};
