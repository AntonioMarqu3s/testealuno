
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function useAdminUserCreate() {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const { currentUserAdminLevel } = useAdminAuth();

  const createAdminUser = async (email: string, password: string, adminLevel: string = 'standard'): Promise<boolean> => {
    try {
      // Only master admins can create other admins
      if (currentUserAdminLevel !== 'master') {
        toast.error("Apenas administradores master podem criar outros administradores");
        return false;
      }

      setIsCreating(true);
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
      return true;
    } catch (err) {
      console.error("Error creating admin user:", err);
      toast.error("Erro ao criar administrador");
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createAdminUser,
    isCreating
  };
}
