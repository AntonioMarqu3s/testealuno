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
        // Buscar dados do usuário admin na tabela 'users'
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', adminId)
          .single();
          
        if (error) throw error;
        
        console.log("Dados brutos do users:", {
          adminId,
          data,
        });

        const adminUserData = {
          ...data,
          plan: data.plan ?? 0,
          plan_name: data.plan_name ?? 'Teste Gratuito',
          agent_limit: data.agent_limit ?? 1
        };
        
        console.log("Dados processados do usuário:", adminUserData);
        
        setAdminUser(adminUserData);
      } catch (err) {
        console.error("Error fetching admin details:", err);
        toast.error("Erro ao carregar detalhes do usuário");
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
    if (!adminId || !adminUser) return;
    
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
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          email: formData.email,
          admin_level: formData.admin_level
        })
        .eq('id', adminId);
        
      if (updateError) throw updateError;

      // Update user plan if changed
      if (formData.plan !== adminUser.plan) {
        console.log("Atualizando plano:", {
          userId: adminUser.user_id,
          planoAtual: adminUser.plan,
          novoPlano: formData.plan,
          formData
        });

        // Primeiro verifica se já existe um plano
        const { data: existingPlan } = await supabase
          .from('user_plans')
          .select('*')
          .eq('user_id', adminUser.user_id)
          .single();

        console.log("Plano existente:", existingPlan);

        const planData = {
          user_id: adminUser.user_id,
          plan: formData.plan,
          name: formData.plan === 0 ? 'Teste Gratuito' :
                formData.plan === 1 ? 'Inicial' :
                formData.plan === 2 ? 'Padrão' :
                'Premium',
          agent_limit: formData.plan === 0 ? 1 :
                      formData.plan === 1 ? 1 :
                      formData.plan === 2 ? 3 :
                      10
        };

        console.log("Dados do novo plano:", planData);

        const { error: planError } = await supabase
          .from('user_plans')
          .upsert(planData);
          
        if (planError) {
          console.error("Erro ao atualizar plano:", planError);
          throw planError;
        }

        console.log("Plano atualizado com sucesso");
      }

      // Also update the auth.users table with the new email
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        adminUser.user_id,
        { email: formData.email }
      );

      if (authUpdateError) throw authUpdateError;
      
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
      
      // Update local state
      setAdminUser(prev => prev ? {
        ...prev,
        email: formData.email,
        admin_level: formData.admin_level,
        plan: formData.plan,
        plan_name: formData.plan === 0 ? 'Teste Gratuito' :
                  formData.plan === 1 ? 'Inicial' :
                  formData.plan === 2 ? 'Padrão' :
                  'Premium',
        agent_limit: formData.plan === 0 ? 1 :
                    formData.plan === 1 ? 1 :
                    formData.plan === 2 ? 3 :
                    10
      } : null);
      
      toast.success("Usuário atualizado com sucesso");
      setShowPasswordFields(false);
      onAdminUpdated(); 
      onClose();
    } catch (err) {
      console.error("Error updating admin:", err);
      toast.error("Erro ao atualizar usuário");
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
