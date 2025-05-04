
import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, Pencil, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminUser {
  id: string;
  user_id: string;
  created_at: string;
  user_email?: string;
  admin_level?: string;
  email?: string;
}

interface AdminUserListItemProps {
  admin: AdminUser;
  currentUserAdminId: string | null;
  currentUserAdminLevel: string | null;
  onRemoveAdmin: (adminId: string, userId: string) => Promise<void>;
  onEditAdmin?: (adminId: string) => void;
}

export function AdminUserListItem({ 
  admin, 
  currentUserAdminId, 
  currentUserAdminLevel, 
  onRemoveAdmin,
  onEditAdmin 
}: AdminUserListItemProps) {
  const getAdminLevelBadge = (level?: string) => {
    if (level === 'master') {
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Admin Master</Badge>;
    }
    return <Badge variant="outline" className="bg-primary/10">Admin</Badge>;
  };

  return (
    <div 
      key={admin.id} 
      className="border rounded-md p-4 flex justify-between items-center"
    >
      <div>
        <div className="flex items-center gap-2">
          {admin.admin_level === 'master' ? (
            <ShieldAlert className="h-4 w-4 text-purple-600" />
          ) : (
            <Shield className="h-4 w-4 text-primary" />
          )}
          <span className="font-medium">{admin.user_email}</span>
          {getAdminLevelBadge(admin.admin_level)}
        </div>
        <p className="text-sm text-muted-foreground">
          Desde {new Date(admin.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        {/* Edit button */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEditAdmin && onEditAdmin(admin.id)}
          disabled={admin.id !== currentUserAdminId && currentUserAdminLevel !== 'master'}
          title={admin.id !== currentUserAdminId && currentUserAdminLevel !== 'master' 
            ? "Apenas administradores master podem editar outros administradores" 
            : "Editar administrador"}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        
        {/* Delete button with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-500 hover:text-red-700"
              disabled={
                admin.id === currentUserAdminId || 
                (admin.admin_level === 'master' && currentUserAdminLevel !== 'master')
              }
              title={
                admin.id === currentUserAdminId 
                  ? "Você não pode remover a si mesmo" 
                  : admin.admin_level === 'master' && currentUserAdminLevel !== 'master'
                  ? "Apenas administradores master podem remover outros administradores master"
                  : "Remover administrador"
              }
            >
              <Trash className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Administrador</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O usuário perderá todos os privilégios administrativos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onRemoveAdmin(admin.id, admin.user_id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
