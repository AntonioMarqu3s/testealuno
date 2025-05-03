
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminUser {
  id: string;
  user_id: string;
  created_at: string;
  user_email?: string;
}

export function AdminUsersManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      
      // Fetch admin users
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (adminError) {
        throw adminError;
      }
      
      // Get user emails
      const userIds = adminData.map(admin => admin.user_id);
      const { data: userData, error: userError } = await supabase.rpc("get_emails_by_ids", { 
        user_ids: userIds
      });
      
      if (userError) {
        console.error("Error fetching user emails:", userError);
      }
      
      // Map emails to admin users
      const enrichedAdmins = adminData.map(admin => ({
        ...admin,
        user_email: userData?.find(user => user.id === admin.user_id)?.email || 'Usuário não encontrado'
      }));
      
      setAdmins(enrichedAdmins);
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Administradores do Sistema</CardTitle>
        <Shield className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
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
                    <span className="font-medium">{admin.user_email}</span>
                    <Badge variant="outline" className="bg-primary/10">Admin</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Desde {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeAdmin(admin.id, admin.user_id)}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
