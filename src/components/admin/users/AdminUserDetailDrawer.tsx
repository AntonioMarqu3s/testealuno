
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface AdminUserDetailDrawerProps {
  adminId: string | null;
  open: boolean;
  onClose: () => void;
  onAdminUpdated: () => void;
}

interface AdminUserFormData {
  email: string;
  admin_level: string;
  password?: string;
  confirmPassword?: string;
}

export function AdminUserDetailDrawer({ adminId, open, onClose, onAdminUpdated }: AdminUserDetailDrawerProps) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false);
  const { currentUserAdminLevel, currentUserAdminId } = useAdminAuth();
  
  // Form states using react-hook-form
  const form = useForm<AdminUserFormData>({
    defaultValues: {
      email: "",
      admin_level: "standard",
      password: "",
      confirmPassword: "",
    },
  });
  
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
        form.reset({
          email: data.email || "",
          admin_level: data.admin_level || data.role || "standard",
          password: "",
          confirmPassword: "",
        });
        
        console.log("Fetched admin data:", data);
      } catch (err) {
        console.error("Error fetching admin details:", err);
        toast.error("Erro ao carregar detalhes do administrador");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdminUser();
  }, [adminId, open, form]);

  const handlePasswordToggle = () => {
    setShowPasswordFields(!showPasswordFields);
  };
  
  const handleUpdateAdmin = async (formData: AdminUserFormData) => {
    if (!adminId) return;
    
    // Validate password if it's being changed
    if (showPasswordFields && formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
    }
    
    setIsUpdating(true);
    try {
      // Check if current user has permission to update admin level
      if (currentUserAdminLevel !== 'master' && formData.admin_level !== adminUser?.admin_level) {
        toast.error("Apenas administradores master podem alterar o nível de admin");
        return;
      }
      
      // Update the admin user's information in admin_users table
      const { error } = await supabase
        .from('admin_users')
        .update({
          email: formData.email,
          admin_level: formData.admin_level
        })
        .eq('id', adminId);
        
      if (error) throw error;
      
      // If password is being updated, call the edge function
      if (showPasswordFields && formData.password) {
        const { data: updateResult, error: updateError } = await supabase.functions.invoke("update-admin-credentials", {
          body: { 
            adminId,
            email: formData.email,
            password: formData.password,
          }
        });
        
        if (updateError) throw updateError;
        
        if (!updateResult.success) {
          throw new Error(updateResult.message || "Erro ao atualizar credenciais");
        }
      }
      
      toast.success("Administrador atualizado com sucesso");
      setShowPasswordFields(false);
      form.reset({
        ...formData,
        password: "",
        confirmPassword: "",
      });
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
              {isLoading ? "Carregando..." : `Editar Administrador: ${form.watch("email")}`}
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdateAdmin)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin-id">ID do Administrador</Label>
                    <Input id="admin-id" value={adminUser?.id || ""} readOnly disabled className="bg-muted" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-id">ID do Usuário</Label>
                    <Input id="user-id" value={adminUser?.user_id || ""} readOnly disabled className="bg-muted" />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Email do administrador"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="admin_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível de Administração</FormLabel>
                        <FormControl>
                          <Select 
                            disabled={!canEditAdminLevel}
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className={!canEditAdminLevel ? "bg-muted" : ""}>
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Padrão</SelectItem>
                              <SelectItem value="master">Master</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        {!canEditAdminLevel && (
                          <p className="text-sm text-muted-foreground">
                            Apenas administradores master podem alterar este campo.
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  
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
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nova Senha</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Digite a nova senha"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirme a Senha</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirme a nova senha"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
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
                  
                  <Separator />
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading || isUpdating}
                    className="w-full"
                  >
                    {isUpdating ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
          
          <DrawerFooter className="px-6">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
