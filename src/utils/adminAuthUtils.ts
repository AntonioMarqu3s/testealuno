
import { supabase } from "@/lib/supabase";
import { ADMIN_SESSION_KEY } from "@/context/AdminAuthContext";

export async function checkAdminStatus(userId: string): Promise<{ 
  isAdmin: boolean;
  adminLevel?: string;
  adminId?: string;
}> {
  try {
    // Verify against user_metadata first (safer approach)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.user_metadata?.role === 'admin') {
      console.log("User confirmed as admin via metadata");
      return { isAdmin: true, adminLevel: user.user_metadata?.adminLevel || 'standard' };
    }
    
    // Fallback to admin_users table check using edge function
    const { data, error } = await supabase.functions.invoke('is_admin_user', { 
      body: { user_id: userId } 
    });
    
    if (error) {
      console.error("Error checking admin status:", error);
      return { isAdmin: false };
    }
    
    return { 
      isAdmin: Boolean(data?.isAdmin), 
      adminLevel: data?.adminLevel || null,
      adminId: data?.adminId || null
    };
  } catch (err) {
    console.error("Error verifying admin status:", err);
    return { isAdmin: false };
  }
}

export async function initializeAdminUser(): Promise<void> {
  try {
    console.log('Creating initial admin user...');
    await supabase.functions.invoke("create-initial-admin");
  } catch (err) {
    console.error("Error in admin initialization:", err);
  }
}

export function getAdminSessionFromStorage(): boolean {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function setAdminSessionInStorage(isAdmin: boolean): void {
  if (isAdmin) {
    localStorage.setItem(ADMIN_SESSION_KEY, "true");
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}
