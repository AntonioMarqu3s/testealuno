
import { createClient } from '@supabase/supabase-js';

// Use default values for development if environment variables are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Log configuration status but don't stop the app from working
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing. Using default values for development. Authentication may not work in production.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
