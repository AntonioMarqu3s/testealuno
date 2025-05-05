import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AdminUser as AdminUserType } from "@/types/admin";
import { AdminUsersList } from "./users/AdminUsersList";
import { AdminUsersLoading } from "./users/AdminUsersLoading";
import { AdminUsersEmptyState } from "./users/AdminUsersEmptyState";

interface AdminUsersProps {
  onEditAdmin?: (adminId: string) => void;
}

// Define a local interface that matches how we're using the data
interface AdminUserData extends AdminUserType {
  user_id: string;
  user_email?: string;
  admin_level?: string;
}

export function AdminUsers({ onEditAdmin }: AdminUsersProps) {
  const [admins, setAdmins] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUserAdminId, currentUserAdminLevel } = useAdminAuth();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching admin users data...");
      
      // Fetch admin users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching admin users:", error);
        throw error;
      }
      
      console.log("Admin data fetched:", data);
      
      // Get user emails if not already in the data
      const userIds = data.filter(admin => !admin.email).map(admin => admin.user_id);
      
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase.rpc("get_emails_by_ids", { 
          user_ids: userIds
        });
        
        if (userError) {
          console.error("Error fetching user emails:", userError);
        } else {
          console.log("User email data:", userData);
        }
        
        // Map emails to admin users
        data.forEach(admin => {
          if (!admin.email) {
            const userEmail = userData?.find(user => user.id === admin.user_id)?.email;
            admin.user_email = userEmail || 'Usuário não encontrado';
          } else {
            admin.user_email = admin.email;
          }
        });
      } else {
        // If emails are already in the data
        data.forEach(admin => {
          admin.user_email = admin.email || 'Usuário não encontrado';
        });
      }
      
      console.log("Final admin data with emails:", data);
      setAdmins(data as AdminUserData[]);
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
      const adminLevel = adminToRemove?.admin_level || adminToRemove?.role;
      
      if (adminLevel === 'master' && currentUserAdminLevel !== 'master') {
        toast.error("Apenas Administradores Master podem remover outros Administradores Master");
        return;
      }
      
      console.log("Removing admin:", adminId);
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
        
      if (error) {
        console.error("Error removing admin:", error);
        throw error;
      }
      
      toast.success("Administrador removido com sucesso");
      fetchAdmins();
    } catch (err) {
      console.error("Error removing admin:", err);
      toast.error("Erro ao remover administrador");
    }
  };
  
  const handleAdminUpdated = () => {
    console.log("Admin updated, refreshing list...");
    fetchAdmins();
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
          onAdminUpdated={handleAdminUpdated}
        />
      )}
    </div>
  );
}
