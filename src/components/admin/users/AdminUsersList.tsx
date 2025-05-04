
import React from "react";
import { AdminUserListItem } from "./AdminUserListItem";

interface AdminUser {
  id: string;
  user_id: string;
  created_at: string;
  user_email?: string;
  admin_level?: string;
  email?: string;
}

interface AdminUsersListProps {
  admins: AdminUser[];
  currentUserAdminId: string | null;
  currentUserAdminLevel: string | null;
  onRemoveAdmin: (adminId: string, userId: string) => Promise<void>;
  onEditAdmin?: (adminId: string) => void;
  onAdminUpdated?: () => void;
}

export function AdminUsersList({
  admins,
  currentUserAdminId,
  currentUserAdminLevel,
  onRemoveAdmin,
  onEditAdmin,
  onAdminUpdated
}: AdminUsersListProps) {
  return (
    <div className="space-y-4">
      {admins.map((admin) => (
        <AdminUserListItem
          key={admin.id}
          admin={admin}
          currentUserAdminId={currentUserAdminId}
          currentUserAdminLevel={currentUserAdminLevel}
          onRemoveAdmin={onRemoveAdmin}
          onEditAdmin={onEditAdmin}
          onAdminUpdated={onAdminUpdated}
        />
      ))}
    </div>
  );
}
