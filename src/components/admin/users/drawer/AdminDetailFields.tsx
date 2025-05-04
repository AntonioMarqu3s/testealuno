
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminUser } from "@/hooks/admin/useAdminUsersList";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminDetailFieldsProps {
  adminUser: AdminUser | null;
  isLoading: boolean;
}

export function AdminDetailFields({ adminUser, isLoading }: AdminDetailFieldsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="admin-id">ID do Administrador</Label>
        <Input id="admin-id" value={adminUser?.id || ""} readOnly disabled className="bg-muted" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="user-id">ID do Usuário</Label>
        <Input id="user-id" value={adminUser?.user_id || ""} readOnly disabled className="bg-muted" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="created-at">Criado em</Label>
        <Input 
          id="created-at" 
          value={adminUser ? new Date(adminUser.created_at).toLocaleString() : ""} 
          readOnly 
          disabled 
          className="bg-muted" 
        />
      </div>
      
      <Separator />
    </>
  );
}
