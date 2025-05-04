
/**
 * Admin System Type Definitions
 */

// Define the possible admin role types
export type AdminRole = 'master' | 'group';

// Admin Types
export type AdminLevel = 'master' | 'group';

export interface Admin {
  id: string;
  email: string;
  name: string;
  level: AdminLevel;
  created_at: string;
  updated_at: string;
}

// Group interface representing a user group in the system
export interface Group {
  id: string;
  name: string;
  description: string;
  admin_id: string;
  admin?: {
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

// User within a group interface
export interface GroupUser {
  user_id: string;
  email: string;
  created_at: string;
}

// Admin user interface with optional groups
export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  groups?: Group[];
  created_at: string;
  user_id?: string; // Added to fix compatibility
  plan?: number;
  plan_name?: string;
  agent_limit?: number;
  payment_date?: string;
  subscription_ends_at?: string;
  payment_status?: string;
  trial_ends_at?: string;
  connect_instancia?: boolean;
}

// Interface for the admin user with additional user details
export interface AdminUserWithDetails extends AdminUser {
  user_id: string;
  user_email?: string;
}

// Admin sidebar menu item interface
export interface AdminMenuItem {
  path: string;
  label: string;
  icon: string;
  requiresMasterAdmin?: boolean;
}
