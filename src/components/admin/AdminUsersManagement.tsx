
import React, { useState } from "react";
import { useAdminUsersManagement } from "@/hooks/admin/useAdminUsersManagement";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminUsers } from "./AdminUsers";
import { CreateAdminForm } from "./CreateAdminForm";

export function AdminUsersManagement() {
  const { currentUserAdminLevel } = useAdminAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { fetchAdminUsers } = useAdminUsersManagement();
  
  // If not master admin, don't show this component
  if (currentUserAdminLevel !== 'master') {
    return (
      <div className="p-6 text-center">
        <Badge variant="outline" className="bg-amber-100 text-amber-800 mb-2">Acesso Restrito</Badge>
        <p>Apenas administradores master podem acessar esta seção.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Administradores</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Administrador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Administrador</DialogTitle>
            </DialogHeader>
            <CreateAdminForm 
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchAdminUsers();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <AdminUsers />
    </div>
  );
}
