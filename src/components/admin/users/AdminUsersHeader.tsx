
import React from "react";
import { useAdminUsersManagement } from "@/hooks/admin/useAdminUsersManagement";
import { AdminCreateDialog } from "./AdminCreateDialog";

interface AdminUsersHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}

export function AdminUsersHeader({ isDialogOpen, setIsDialogOpen }: AdminUsersHeaderProps) {
  const { fetchAdminUsers } = useAdminUsersManagement();
  
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold">Administradores</h2>
      <AdminCreateDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        onSuccess={fetchAdminUsers}
      />
    </div>
  );
}
