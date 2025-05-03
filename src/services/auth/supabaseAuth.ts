
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { updateCurrentUserEmail } from '../user/userService';
import { getUserAgents } from '../agent/agentStorageService';
import { getUserPlan } from '../plan/userPlanService';
import { migrateAgentsToSupabase } from '../agent/supabaseAgentService';
import { migratePlanToSupabase } from '../plan/supabsePlanService';

// Get the current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
  return data.user;
};

// Check if the user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Sign out the current user
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    
    // Clear local storage data as well for the transition period
    localStorage.removeItem('user_email');
    
    toast.success("Logout realizado com sucesso");
  } catch (error: any) {
    console.error('Error signing out:', error);
    toast.error("Erro ao fazer logout");
  }
};

// Get current user email
export const getCurrentUserEmail = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  return user?.email || null;
};

// Initialize user data after login
export const initializeUserDataAfterLogin = async (): Promise<void> => {
  const user = await getCurrentUser();
  if (user && user.email) {
    console.log("Initializing user data after login for:", user.email);
    updateCurrentUserEmail(user.email);
    
    // Migrate local data to Supabase
    await migrateLocalDataToSupabase(user.id, user.email);
  }
};

// Migrate local data to Supabase
export const migrateLocalDataToSupabase = async (userId: string, email: string): Promise<void> => {
  try {
    console.log(`Starting data migration for user ${email}`);
    
    // 1. Migrate user plan data first
    const userPlan = getUserPlan(email);
    console.log(`Migrating plan data for user ${email}:`, userPlan);
    await migratePlanToSupabase(userId, email, userPlan);
    
    // 2. Migrate agents data
    const localAgents = getUserAgents(email);
    console.log(`Migrating ${localAgents.length} agents for user ${email}`);
    await migrateAgentsToSupabase(userId, email, localAgents);
    
    console.log(`Data migration completed for user ${email}`);
    
    // Force refresh of data on the settings page if user is on that page
    if (window.location.pathname === '/settings') {
      console.log('User is on settings page, refreshing data...');
      window.location.reload();
    }
  } catch (error) {
    console.error('Error migrating data to Supabase:', error);
  }
};

// Force synchronize user plan data with Supabase
export const forceSyncUserPlanWithSupabase = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user || !user.email) return false;
    
    const userPlan = getUserPlan(user.email);
    await migratePlanToSupabase(user.id, user.email, userPlan);
    return true;
  } catch (error) {
    console.error('Error force syncing user plan with Supabase:', error);
    return false;
  }
};
