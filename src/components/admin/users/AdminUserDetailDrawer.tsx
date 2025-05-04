
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
import { Card } from "@/components/ui/card";

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
  const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false);
  const { currentUserAdminLevel, currentUserAdminId } = useAdminAuth();
  
  // Form states for the selected admin
  const [email, setEmail] = useState<string>("");
  const [adminLevel, setAdminLevel] = useState<string>("standard");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
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
        setPassword("");
        setConfirmPassword("");
        
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

  const handlePasswordToggle = () => {
    setShowPasswordFields(!showPasswordFields);
  };
  
  const handleUpdateAdmin = async () => {
    if (!adminId) return;
    
    // Validate password if it's being changed
    if (showPasswordFields && password) {
      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
      if (password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
    }
    
    setIsUpdating(true);
    try {
      // Check if current user has permission to update admin level
      if (currentUserAdminLevel !== 'master' && adminLevel !== adminUser?.admin_level) {
        toast.error("Apenas administradores master podem alterar o nível de admin");
        return;
      }
      
      // Update the admin user's information in admin_users table
      const { error } = await supabase
        .from('admin_users')
        .update({
          email,
          admin_level: adminLevel
        })
        .eq('id', adminId);
        
      if (error) throw error;
      
      // If password is being updated, call the edge function
      if (showPasswordFields && password) {
        const { data: updateResult, error: updateError } = await supabase.functions.invoke("update-admin-credentials", {
          body: { 
            adminId,
            email,
            password,
          }
        });
        
        if (updateError) throw updateError;
        
        if (!updateResult.success) {
          throw new Error(updateResult.message || "Erro ao atualizar credenciais");
        }
      }
      
      toast.success("Administrador atualizado com sucesso");
      setShowPasswordFields(false);
      setPassword("");
      setConfirmPassword("");
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePasswordToggle}
                  >
                    {showPasswordFields ? "Cancelar Alteração de Senha" : "Alterar Senha"}
                  </Button>
                </div>
                
                {showPasswordFields && (
                  <Card className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Nova Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirme a Senha</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a nova senha"
                      />
                    </div>
                  </Card>
                )}
                
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
