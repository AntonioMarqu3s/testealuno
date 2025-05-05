import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function useAdminUserDelete() {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { currentUserAdminLevel } = useAdminAuth();

  const deleteAdminUser = async (adminId: string): Promise<boolean> => {
    try {
      // Only master admins can delete other admins
      if (currentUserAdminLevel !== 'master') {
        toast.error("Apenas administradores master podem remover outros administradores");
        return false;
      }

      setIsDeleting(true);
      console.log("Deleting admin user:", adminId);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', adminId);
      
      if (error) {
        toast.error("Erro ao remover administrador", {
          description: error.message
        });
        return false;
      }
      
      toast.success("Administrador removido com sucesso");
      return true;
    } catch (err) {
      console.error("Error deleting admin user:", err);
      toast.error("Erro ao remover administrador");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAdminUser,
    isDeleting
  };
}
