
import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Badge } from "@/components/ui/badge";

export default function AdminSettings() {
  const { currentUserAdminLevel } = useAdminAuth();

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Configure os parâmetros globais do sistema
          </p>
        </div>
        
        {currentUserAdminLevel !== 'master' ? (
          <div className="p-6 text-center">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 mb-2">Acesso Restrito</Badge>
            <p>Apenas administradores master podem acessar esta seção.</p>
          </div>
        ) : (
          <div className="border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">
              Funcionalidade em desenvolvimento.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
