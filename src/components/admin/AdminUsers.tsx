import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AdminUser } from "@/types/admin";
import { AdminUsersList } from "./users/AdminUsersList";
import { AdminUsersLoading } from "./users/AdminUsersLoading";
import { AdminUsersEmptyState } from "./users/AdminUsersEmptyState";

interface AdminUsersProps {
  onEditAdmin?: (adminId: string) => void;
}

export function AdminUsers({ onEditAdmin }: AdminUsersProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUserAdminId, currentUserAdminLevel } = useAdminAuth();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      
      // Fetch admin users using direct SQL for reliability
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
      if (adminToRemove?.role === 'master' && currentUserAdminLevel !== 'master') {
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
  
  return (
    <div>
      {loading ? (
        <AdminUsersLoading />
      ) : admins.length === 0 ? (
        <AdminUsersEmptyState />
      ) : (
        <AdminUsersList 
          admins={admins}
          currentUserAdminId={currentUserAdminId}
          currentUserAdminLevel={currentUserAdminLevel}
          onRemoveAdmin={removeAdmin}
          onEditAdmin={onEditAdmin}
        />
      )}
    </div>
  );
}
