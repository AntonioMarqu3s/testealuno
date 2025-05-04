
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";
import { AdminCreateButton } from "./AdminCreateButton";

interface AdminCreateDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export function AdminCreateDialog({ isOpen, setIsOpen, onSuccess }: AdminCreateDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <AdminCreateButton />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Administrador</DialogTitle>
        </DialogHeader>
        <CreateAdminForm 
          onSuccess={() => {
            setIsOpen(false);
            onSuccess();
          }} 
        />
      </DialogContent>
    </Dialog>
  );
}
