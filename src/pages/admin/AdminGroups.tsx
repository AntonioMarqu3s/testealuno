
import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Badge } from "@/components/ui/badge";
import { GroupManagement } from "@/components/admin/groups/GroupManagement";

export default function AdminGroups() {
  const { currentUserAdminLevel } = useAdminAuth();

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gerenciar Grupos</h1>
          <p className="text-muted-foreground">
            Organize usuários em grupos para melhor gerenciamento
          </p>
        </div>
        
        {currentUserAdminLevel !== 'master' ? (
          <div className="p-6 text-center">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 mb-2">Acesso Restrito</Badge>
            <p>Apenas administradores master podem acessar esta seção.</p>
          </div>
        ) : (
          <GroupManagement />
        )}
      </div>
    </AdminLayout>
  );
}
