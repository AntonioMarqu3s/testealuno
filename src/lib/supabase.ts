
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Default values that will allow the app to initialize but won't work for actual authentication
const supabaseUrl = 'https://ehotbpdibacbrqsgsnbv.supabase.co'; // Example public project
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVob3RicGRpYmFjYnJxc2dzbmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxODg5MjUsImV4cCI6MjAzMDc2NDkyNX0.XDRMx47XxnzaURJrNKSKOMVtRRqAfhxrz_w22aZYjds'; // Public demo key

console.log('🔑 Supabase configuration:');
console.log('URL:', supabaseUrl);
console.log('ANON KEY:', supabaseAnonKey.substring(0, 5) + '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 5));

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection and show alerts as needed
(async () => {
  try {
    // Simple test to check if the Supabase connection works
    const { data, error } = await supabase.from('agents').select('id').limit(1);
    
    if (error) {
      console.error('⚠️ Supabase connection error:', error);
      toast.error('Erro de conexão com o Supabase', {
        description: 'Verifique as credenciais e conexão com a internet.',
        duration: 8000,
      });
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
