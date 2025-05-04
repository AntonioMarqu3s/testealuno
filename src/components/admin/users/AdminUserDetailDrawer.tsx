
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useAdminUserDrawer } from "@/hooks/admin/useAdminUserDrawer";
import { AdminDetailFields } from "./drawer/AdminDetailFields";
import { AdminUserForm, AdminUserFormData } from "./drawer/AdminUserForm";

interface AdminUserDetailDrawerProps {
  adminId: string | null;
  open: boolean;
  onClose: () => void;
  onAdminUpdated: () => void;
}

export function AdminUserDetailDrawer({ adminId, open, onClose, onAdminUpdated }: AdminUserDetailDrawerProps) {
  const {
    adminUser,
    isLoading,
    isUpdating,
    showPasswordFields,
    handlePasswordToggle,
    handleUpdateAdmin,
    canEditAdminLevel,
    isCurrentAdmin
  } = useAdminUserDrawer(adminId, onClose, onAdminUpdated);
  
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
