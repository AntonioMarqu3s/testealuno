
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  admin_level: string;
  created_at: string;
}

export function useAdminUsersList() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUserAdminLevel } = useAdminAuth();

  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching admin users");
      
      const { data, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error("Error fetching admin users:", fetchError);
        throw new Error(`Error fetching admin users: ${fetchError.message}`);
      }
      
      console.log(`Successfully fetched ${data?.length || 0} admin users:`, data);
      setAdminUsers(data || []);
    } catch (err) {
      console.error("Error in fetchAdminUsers:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch admin users";
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error("Erro ao carregar administradores", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, [currentUserAdminLevel]);

  return {
    adminUsers,
    isLoading,
    error,
    fetchAdminUsers
  };
}
