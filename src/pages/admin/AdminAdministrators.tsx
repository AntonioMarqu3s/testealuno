
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminUsersManagement } from "@/components/admin/AdminUsers";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";

export default function AdminAdministrators() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleAdminCreated = () => {
    setDialogOpen(false);
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gerenciar Administradores</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Adicionar Administrador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Administrador</DialogTitle>
              </DialogHeader>
              <CreateAdminForm onSuccess={handleAdminCreated} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-6">
          <AdminUsersManagement key={refreshKey} />
        </div>
      </div>
    </AdminLayout>
  );
}
