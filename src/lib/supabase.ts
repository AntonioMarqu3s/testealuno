
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set. Authentication will not work.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

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
