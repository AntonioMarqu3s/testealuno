
import { AdminUser, AdminRole, Group } from "@/types/admin";

// Re-export the types from the central file
export type { AdminUser, AdminRole, Group };

// Export any additional user-specific types
export interface AdminUserTableData extends AdminUser {
  user_id: string;
  user_email?: string;
}
