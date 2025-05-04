
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useUserDetailDrawer } from "@/hooks/admin/useUserDetailDrawer";
import { UserDetailFields } from "./drawer/UserDetailFields";
import { UserForm } from "./drawer/UserForm";

interface UserDetailDrawerProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function UserDetailDrawer({ userId, open, onClose, onUserUpdated }: UserDetailDrawerProps) {
  const {
    userData,
    isLoading,
    isUpdating,
    showPasswordFields,
    handlePasswordToggle,
    handleUpdateUser,
  } = useUserDetailDrawer(userId, onClose, onUserUpdated);
  
  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              {isLoading ? "Carregando..." : `Editar Usuário: ${userData?.email || ""}`}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-6">
              <UserDetailFields 
                userData={userData} 
                isLoading={isLoading} 
              />
              
              {!isLoading && (
                <UserForm
                  userData={userData}
                  isUpdating={isUpdating}
                  showPasswordFields={showPasswordFields}
                  handlePasswordToggle={handlePasswordToggle}
                  onSubmit={handleUpdateUser}
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
