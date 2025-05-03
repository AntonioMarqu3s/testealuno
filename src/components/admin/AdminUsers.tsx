
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
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

interface AdminUsersProps {
  onEditAdmin?: (adminId: string) => void;
}

export function AdminUsers({ onEditAdmin }: AdminUsersProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserAdminId, setCurrentUserAdminId] = useState<string | null>(null);
  const [currentUserAdminLevel, setCurrentUserAdminLevel] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      
      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      
      // Check current user's admin level
      const { data: currentAdminData } = await supabase.functions.invoke("is_admin_user", {
        body: { user_id: user.id }
      });
      
      if (currentAdminData?.isAdmin) {
        setCurrentUserAdminId(currentAdminData.adminId);
        setCurrentUserAdminLevel(currentAdminData.adminLevel);
      }
      
      // Fetch admin users
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (adminError) {
        throw adminError;
      }
      
      // Get user emails if not already in the data
      const userIds = adminData.filter(admin => !admin.email).map(admin => admin.user_id);
      
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase.rpc("get_emails_by_ids", { 
          user_ids: userIds
        });
        
        if (userError) {
          console.error("Error fetching user emails:", userError);
        }
        
        // Map emails to admin users
        adminData.forEach(admin => {
          if (!admin.email) {
            const userEmail = userData?.find(user => user.id === admin.user_id)?.email;
            admin.user_email = userEmail || 'Usuário não encontrado';
          } else {
            admin.user_email = admin.email;
          }
        });
      } else {
        // If emails are already in the data
        adminData.forEach(admin => {
          admin.user_email = admin.email || 'Usuário não encontrado';
        });
      }
      
      setAdmins(adminData);
    } catch (err) {
      console.error("Error fetching admin users:", err);
      toast.error("Erro ao carregar administradores");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  const removeAdmin = async (adminId: string, userId: string) => {
    try {
      // Cannot remove yourself
      if (adminId === currentUserAdminId) {
        toast.error("Você não pode remover a si mesmo");
        return;
      }
      
      // Check if trying to remove a master admin
      const adminToRemove = admins.find(admin => admin.id === adminId);
      if (adminToRemove?.admin_level === 'master' && currentUserAdminLevel !== 'master') {
        toast.error("Apenas Administradores Master podem remover outros Administradores Master");
        return;
      }
      
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
        
      if (error) {
        throw error;
      }
      
      toast.success("Administrador removido com sucesso");
      fetchAdmins();
    } catch (err) {
      console.error("Error removing admin:", err);
      toast.error("Erro ao remover administrador");
    }
  };
  
  const getAdminLevelBadge = (level?: string) => {
    if (level === 'master') {
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Admin Master</Badge>;
    }
    return <Badge variant="outline" className="bg-primary/10">Admin</Badge>;
  };
  
  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : admins.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          Nenhum administrador encontrado
        </p>
      ) : (
        <div className="space-y-4">
          {admins.map((admin) => (
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
                        onClick={() => removeAdmin(admin.id, admin.user_id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
