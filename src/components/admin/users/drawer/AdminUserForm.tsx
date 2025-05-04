
import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { AdminUser } from "@/hooks/admin/useAdminUsersList";
import { Button } from "@/components/ui/button";
import { PasswordFields } from "./PasswordFields";

export interface AdminUserFormData {
  email: string;
  admin_level: string;
  password?: string;
  confirmPassword?: string;
}

interface AdminUserFormProps {
  adminUser: AdminUser | null;
  isUpdating: boolean;
  showPasswordFields: boolean;
  handlePasswordToggle: () => void;
  onSubmit: (data: AdminUserFormData) => Promise<void>;
  canEditAdminLevel: boolean;
  isCurrentAdmin: boolean;
}

export function AdminUserForm({
  adminUser,
  isUpdating,
  showPasswordFields,
  handlePasswordToggle,
  onSubmit,
  canEditAdminLevel,
  isCurrentAdmin
}: AdminUserFormProps) {
  const form = useForm<AdminUserFormData>({
    defaultValues: {
      email: adminUser?.email || "",
      admin_level: adminUser?.admin_level || adminUser?.role || "standard",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
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
            <PasswordFields control={form.control} />
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  );
}
