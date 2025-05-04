
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { AdminUser } from "@/hooks/admin/useAdminUsersList";
import { AdminUserFormData } from "@/components/admin/users/drawer/AdminUserForm";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function useAdminUserDrawer(adminId: string | null, onClose: () => void, onAdminUpdated: () => void) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false);
  const { currentUserAdminLevel, currentUserAdminId } = useAdminAuth();
  
  // Fetch admin details of the selected admin
  useEffect(() => {
    const fetchAdminUser = async () => {
      if (!adminId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', adminId)
          .single();
          
        if (error) throw error;
        
        setAdminUser(data);
        console.log("Fetched admin data:", data);
      } catch (err) {
        console.error("Error fetching admin details:", err);
        toast.error("Erro ao carregar detalhes do administrador");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminUser();
  }, [adminId]);

  const handlePasswordToggle = () => {
    setShowPasswordFields(!showPasswordFields);
  };
  
  const handleUpdateAdmin = async (formData: AdminUserFormData) => {
    if (!adminId) return;
    
    // Validate password if it's being changed
    if (showPasswordFields && formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
    }
    
    setIsUpdating(true);
    try {
      // Check if current user has permission to update admin level
      if (currentUserAdminLevel !== 'master' && formData.admin_level !== adminUser?.admin_level) {
        toast.error("Apenas administradores master podem alterar o nível de admin");
        return;
      }
      
      // Update the admin user's information in admin_users table
      const { error } = await supabase
        .from('admin_users')
        .update({
          email: formData.email,
          admin_level: formData.admin_level
        })
        .eq('id', adminId);
        
      if (error) throw error;
      
      // If password is being updated, call the edge function
      if (showPasswordFields && formData.password) {
        const { data: updateResult, error: updateError } = await supabase.functions.invoke("update-admin-credentials", {
          body: { 
            adminId,
            email: formData.email,
            password: formData.password,
          }
        });
        
        if (updateError) throw updateError;
        
        if (!updateResult.success) {
          throw new Error(updateResult.message || "Erro ao atualizar credenciais");
        }
      }
      
      toast.success("Administrador atualizado com sucesso");
      setShowPasswordFields(false);
      onAdminUpdated(); 
      onClose();
    } catch (err) {
      console.error("Error updating admin:", err);
      toast.error("Erro ao atualizar administrador");
    } finally {
      setIsUpdating(false);
    }
  };

  const canEditAdminLevel = currentUserAdminLevel === 'master';
  const isCurrentAdmin = adminUser?.id === currentUserAdminId;

  return {
    adminUser,
    isLoading,
    isUpdating,
    showPasswordFields,
    handlePasswordToggle,
    handleUpdateAdmin,
    canEditAdminLevel,
    isCurrentAdmin
  };
}
