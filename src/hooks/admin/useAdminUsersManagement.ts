
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

export function useAdminUsersManagement() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUserAdminLevel } = useAdminAuth();

  const fetchAdminUsers = async () => {
    // Only master admins can view other admins
    if (currentUserAdminLevel !== 'master') {
      setAdminUsers([]);
      setIsLoading(false);
      return;
    }

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
      
      console.log(`Successfully fetched ${data?.length || 0} admin users`);
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

  const createAdminUser = async (email: string, password: string, adminLevel: string = 'standard'): Promise<boolean> => {
    try {
      // Only master admins can create other admins
      if (currentUserAdminLevel !== 'master') {
        toast.error("Apenas administradores master podem criar outros administradores");
        return false;
      }

      console.log("Creating new admin user with level:", adminLevel);
      
      const { data, error } = await supabase.functions.invoke("admin-create-admin", {
        body: { email, password, adminLevel }
      });
      
      if (error) {
        toast.error("Erro ao criar administrador", {
          description: error.message
        });
        return false;
      }
      
      toast.success("Administrador criado com sucesso");
      fetchAdminUsers();
      return true;
    } catch (err) {
      console.error("Error creating admin user:", err);
      toast.error("Erro ao criar administrador");
      return false;
    }
  };

  const deleteAdminUser = async (adminId: string): Promise<boolean> => {
    try {
      // Only master admins can delete other admins
      if (currentUserAdminLevel !== 'master') {
        toast.error("Apenas administradores master podem remover outros administradores");
        return false;
      }

      console.log("Deleting admin user:", adminId);
      
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
      
      if (error) {
        toast.error("Erro ao remover administrador", {
          description: error.message
        });
        return false;
      }
      
      toast.success("Administrador removido com sucesso");
      fetchAdminUsers();
      return true;
    } catch (err) {
      console.error("Error deleting admin user:", err);
      toast.error("Erro ao remover administrador");
      return false;
    }
  };

  return {
    adminUsers,
    isLoading,
    error,
    fetchAdminUsers,
    createAdminUser,
    deleteAdminUser
  };
}
