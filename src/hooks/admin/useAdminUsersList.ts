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
  plan: number;
  plan_name: string;
  agent_limit: number;
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
        .select(`
          *,
          user_plans!user_id (
            name,
            agent_limit,
            plan
          )
        `)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error("Error fetching admin users:", fetchError);
        throw new Error(`Error fetching admin users: ${fetchError.message}`);
      }
      
      // Mapear os dados incluindo informações do plano
      const mappedData = data?.map(user => ({
        ...user,
        plan: user.user_plans?.plan || 0,
        plan_name: user.user_plans?.name || 'Teste Gratuito',
        agent_limit: user.user_plans?.agent_limit || 1
      })) || [];
      
      console.log(`Successfully fetched ${mappedData.length} admin users:`, mappedData);
      setAdminUsers(mappedData);
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
