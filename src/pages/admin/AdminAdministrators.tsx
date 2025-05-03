
import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminUsersManagement } from "@/components/admin/AdminUsers";

export default function AdminAdministrators() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Gerenciar Administradores</h1>
        
        <div className="space-y-6">
          <AdminUsersManagement />
        </div>
      </div>
    </AdminLayout>
  );
}
