
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, Pencil, Trash, Eye } from "lucide-react";
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
import { AdminUserDetailDrawer } from "./AdminUserDetailDrawer";

interface AdminUser {
  id: string;
  user_id: string;
  created_at: string;
  user_email?: string;
  admin_level?: string;
  email?: string;
  role?: string;
}

interface AdminUserListItemProps {
  admin: AdminUser;
  currentUserAdminId: string | null;
  currentUserAdminLevel: string | null;
  onRemoveAdmin: (adminId: string, userId: string) => Promise<void>;
  onEditAdmin?: (adminId: string) => void;
  onAdminUpdated?: () => void;
}

export function AdminUserListItem({ 
  admin, 
  currentUserAdminId, 
  currentUserAdminLevel, 
  onRemoveAdmin,
  onEditAdmin, 
  onAdminUpdated 
}: AdminUserListItemProps) {
  // Use the admin_level field first, then fall back to role if needed
  const adminLevel = admin.admin_level || admin.role || 'standard';
  const email = admin.user_email || admin.email || 'Email não disponível';
  
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  
  const getAdminLevelBadge = (level?: string) => {
    if (level === 'master') {
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Admin Master</Badge>;
    }
    return <Badge variant="outline" className="bg-primary/10">Admin</Badge>;
  };
  
  const handleOpenDetails = () => {
    setIsDetailDrawerOpen(true);
  };

  const handleEditClick = () => {
    handleOpenDetails();
  };

  const canEdit = admin.id === currentUserAdminId || currentUserAdminLevel === 'master';

  return (
    <>
      <div className="border rounded-md p-4 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            {adminLevel === 'master' ? (
              <ShieldAlert className="h-4 w-4 text-purple-600" />
            ) : (
              <Shield className="h-4 w-4 text-primary" />
            )}
            <span className="font-medium">{email}</span>
            {getAdminLevelBadge(adminLevel)}
          </div>
          <p className="text-sm text-muted-foreground">
            Desde {new Date(admin.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Detail button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleEditClick}
            title="Editar administrador"
          >
            <Eye className="h-4 w-4" />
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
                  (adminLevel === 'master' && currentUserAdminLevel !== 'master')
                }
                title={
                  admin.id === currentUserAdminId 
                    ? "Você não pode remover a si mesmo" 
                    : adminLevel === 'master' && currentUserAdminLevel !== 'master'
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
      
      {/* Admin details drawer - for editing */}
      <AdminUserDetailDrawer
        adminId={admin.id}
        open={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onAdminUpdated={() => {
          if (onAdminUpdated) onAdminUpdated();
        }}
      />
    </>
  );
}
