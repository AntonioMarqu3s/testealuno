
import React, { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AdminUsersHeader } from "./users/AdminUsersHeader";
import { AdminUsersContent } from "./users/AdminUsersContent";
import { AdminAccessRestriction } from "./users/AdminAccessRestriction";

export function AdminUsersManagement() {
  const { currentUserAdminLevel } = useAdminAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // If not master admin, don't show this component
  if (currentUserAdminLevel !== 'master') {
    return <AdminAccessRestriction />;
  }

  return (
    <div className="space-y-6">
      <AdminUsersHeader 
        isDialogOpen={isDialogOpen} 
        setIsDialogOpen={setIsDialogOpen} 
      />
      <AdminUsersContent />
    </div>
  );
}
