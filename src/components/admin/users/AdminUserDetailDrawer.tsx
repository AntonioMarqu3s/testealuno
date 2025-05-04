
import React, { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AdminUser } from "@/hooks/admin/useAdminUsersList";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminUserDetailDrawerProps {
  adminId: string | null;
  open: boolean;
  onClose: () => void;
  onAdminUpdated: () => void;
}

export function AdminUserDetailDrawer({ adminId, open, onClose, onAdminUpdated }: AdminUserDetailDrawerProps) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { currentUserAdminLevel, currentUserAdminId } = useAdminAuth();
  
  // Form states for the selected admin (not the logged-in admin)
  const [email, setEmail] = useState<string>("");
  const [adminLevel, setAdminLevel] = useState<string>("standard");
  
  // Fetch admin details of the selected admin
  useEffect(() => {
    const fetchAdminUser = async () => {
      if (!adminId || !open) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', adminId)
          .single();
          
        if (error) throw error;
        
        setAdminUser(data);
        
        // Initialize form fields with the selected admin's data
        setEmail(data.email || "");
        setAdminLevel(data.admin_level || data.role || "standard");
        
        console.log("Fetched admin data:", data);
      } catch (err) {
        console.error("Error fetching admin details:", err);
        toast.error("Erro ao carregar detalhes do administrador");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminUser();
  }, [adminId, open]);
  
  const handleUpdateAdmin = async () => {
    if (!adminId) return;
    
    setIsUpdating(true);
    try {
      // Check if current user has permission to update admin level
      if (currentUserAdminLevel !== 'master' && adminLevel !== adminUser?.admin_level) {
        toast.error("Apenas administradores master podem alterar o nível de admin");
        return;
      }
      
      // Update the admin user's information
      const { error } = await supabase
        .from('admin_users')
        .update({
          email,
          admin_level: adminLevel
        })
        .eq('id', adminId);
        
      if (error) throw error;
      
      toast.success("Administrador atualizado com sucesso");
      onAdminUpdated(); // Refresh the admin list
    } catch (err) {
      console.error("Error updating admin:", err);
      toast.error("Erro ao atualizar administrador");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const canEditAdminLevel = currentUserAdminLevel === 'master';
  const isCurrentAdmin = adminUser?.id === currentUserAdminId;
  
  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              {isLoading ? "Carregando..." : `Editar Administrador: ${email}`}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-2/3" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="admin-id">ID do Administrador</Label>
                  <Input id="admin-id" value={adminUser?.id || ""} readOnly disabled className="bg-muted" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user-id">ID do Usuário</Label>
                  <Input id="user-id" value={adminUser?.user_id || ""} readOnly disabled className="bg-muted" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email do administrador"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-level">Nível de Administração</Label>
                  <Select 
                    value={adminLevel} 
                    onValueChange={setAdminLevel}
                    disabled={!canEditAdminLevel}
                  >
                    <SelectTrigger id="admin-level" className={!canEditAdminLevel ? "bg-muted" : ""}>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Padrão</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                    </SelectContent>
                  </Select>
                  {!canEditAdminLevel && (
                    <p className="text-sm text-muted-foreground">
                      Apenas administradores master podem alterar este campo.
                    </p>
                  )}
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
              </div>
            )}
          </div>
          
          <DrawerFooter className="px-6">
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button 
                onClick={handleUpdateAdmin} 
                disabled={isLoading || isUpdating}
                className="ml-2"
              >
                {isUpdating ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
