
import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminUsersManagement } from "@/components/admin/AdminUsersManagement";

export default function AdminAdministrators() {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gerenciar Administradores</h1>
          <p className="text-muted-foreground">
            Gerencie as contas de administrador do sistema e suas permissões
          </p>
        </div>
        
        <div className="space-y-6">
          <AdminUsersManagement />
        </div>
      </div>
    </AdminLayout>
  );
}
