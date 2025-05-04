
/**
 * Admin System Type Definitions
 */

// Define the possible admin role types
export type AdminRole = 'master' | 'group';

// Group interface representing a user group in the system
export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  total_users: number;
  total_admins: number;
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
