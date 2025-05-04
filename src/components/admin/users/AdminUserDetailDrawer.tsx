
import React, { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AdminUser } from "@/hooks/admin/useAdminUsersList";
import { AdminDetailFields } from "./drawer/AdminDetailFields";
import { AdminUserForm, AdminUserFormData } from "./drawer/AdminUserForm";

interface AdminUserDetailDrawerProps {
  adminId: string | null;
  open: boolean;
  onClose: () => void;
  onAdminUpdated: () => void;
}

export function AdminUserDetailDrawer({ adminId, open, onClose, onAdminUpdated }: AdminUserDetailDrawerProps) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false);
  const { currentUserAdminLevel, currentUserAdminId } = useAdminAuth();
  
  // Fetch admin details of the selected admin
  useEffect(() => {
    const fetchAdminUser = async () => {
      if (!adminId || !open) return;
      
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
  }, [adminId, open]);

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
      onAdminUpdated(); // Refresh the admin list
    } catch (err) {
      console.error("Error updating admin:", err);
      toast.error("Erro ao atualizar administrador");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const canEditAdminLevel = currentUserAdminLevel === 'master';
  const isCurrentAdmin = adminUser?.id === currentUserAdminId;
  
  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              {isLoading ? "Carregando..." : `Editar Administrador: ${adminUser?.email || ""}`}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-6">
              <AdminDetailFields 
                adminUser={adminUser} 
                isLoading={isLoading} 
              />
              
              {!isLoading && (
                <AdminUserForm
                  adminUser={adminUser}
                  isUpdating={isUpdating}
                  showPasswordFields={showPasswordFields}
                  handlePasswordToggle={handlePasswordToggle}
                  onSubmit={handleUpdateAdmin}
                  canEditAdminLevel={canEditAdminLevel}
                  isCurrentAdmin={isCurrentAdmin}
                />
              )}
            </div>
          </div>
          
          <DrawerFooter className="px-6">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
