
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdminUserDrawer } from "@/hooks/admin/useAdminUserDrawer";
import { AdminDetailFields } from "./drawer/AdminDetailFields";
import { AdminUserForm } from "./drawer/AdminUserForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isLoading ? "Carregando..." : `Editar Usuário: ${adminUser?.email || ""}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1">
          <Tabs defaultValue="informacoes" className="space-y-6">
            <TabsList>
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
              <TabsTrigger value="plano">Plano</TabsTrigger>
            </TabsList>
            
            <TabsContent value="informacoes" className="space-y-6">
              <AdminDetailFields 
                adminUser={adminUser} 
                isLoading={isLoading} 
              />
              
              {!isLoading && adminUser && (
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
            </TabsContent>
            
            <TabsContent value="plano" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {adminUser && (
                    <div className="space-y-4">
                      <div className="border p-4 rounded-md bg-muted/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{adminUser.plan_name || 'Teste Gratuito'}</h3>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                              {adminUser.plan === 0 ? "Free Trial" : 
                               adminUser.plan === 1 ? "Básico" :
                               adminUser.plan === 2 ? "Standard" :
                               adminUser.plan === 3 ? "Premium" : "Desconhecido"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <AdminUserForm
                        adminUser={adminUser}
                        isUpdating={isUpdating}
                        showPasswordFields={showPasswordFields}
                        handlePasswordToggle={handlePasswordToggle}
                        onSubmit={handleUpdateAdmin}
                        canEditAdminLevel={canEditAdminLevel}
                        isCurrentAdmin={isCurrentAdmin}
                      />
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
