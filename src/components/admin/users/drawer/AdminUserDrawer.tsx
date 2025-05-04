
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdminUserDrawer } from "@/hooks/admin/useAdminUserDrawer";
import { AdminDetailFields } from "./AdminDetailFields";
import { AdminUserForm } from "./AdminUserForm";
import { UserAgentsList } from "../drawer/UserAgentsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlanInfo } from "./UserPlanInfo";
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
              <TabsTrigger value="agentes">Agentes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="informacoes" className="space-y-6">
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
            </TabsContent>
            
            <TabsContent value="plano" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <UserPlanInfo 
                  plan={{
                    id: adminUser?.id || '',
                    plan: adminUser?.plan || 0, 
                    name: adminUser?.plan_name || 'Teste Gratuito', 
                    agent_limit: adminUser?.agent_limit || 1,
                    payment_status: adminUser?.payment_status,
                    payment_date: adminUser?.payment_date,
                    subscription_ends_at: adminUser?.subscription_ends_at,
                    trial_ends_at: adminUser?.trial_ends_at,
                    connect_instancia: adminUser?.connect_instancia
                  }}
                />
              )}
            </TabsContent>
            
            <TabsContent value="agentes">
              {adminUser && <UserAgentsList userId={adminUser.user_id || ''} />}
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
