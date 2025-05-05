
import React from "react";
import { UserPlanInfo } from './UserPlanInfo';
import { TabsContent } from "@/components/ui/tabs";
import { AdminUserForm } from './AdminUserForm';

export function AdminUserDrawer() {
  return (
    <TabsContent value="plano" className="space-y-4">
      <UserPlanInfo 
        plan={0} 
        planName="Teste Gratuito" 
      />
      <AdminUserForm
        adminUser={null}
        isUpdating={false}
        showPasswordFields={false}
        handlePasswordToggle={() => {}}
        onSubmit={() => {}}
        canEditAdminLevel={false}
        isCurrentAdmin={false}
      />
    </TabsContent>
  );
}
