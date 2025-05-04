
import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { AdminUser, UserFormData } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AdminUserFormData extends UserFormData {
  email: string;
  admin_level: string;
  plan: number;
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

// Password Fields component
function PasswordFields({ control }: { control: any }) {
  return (
    <div className="space-y-2">
      <FormField
        control={control}
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
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmar Senha</FormLabel>
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
    </div>
  );
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
    values: {
      email: adminUser?.email || "",
      admin_level: adminUser?.admin_level || "standard",
      plan: adminUser?.plan || 0,
      password: "",
      confirmPassword: "",
    },
  });

  // Atualiza o formulário quando os dados do usuário mudam
  React.useEffect(() => {
    if (adminUser) {
      form.reset({
        email: adminUser.email,
        admin_level: adminUser.admin_level || "standard",
        plan: adminUser.plan || 0,
        password: "",
        confirmPassword: "",
      });
    }
  }, [adminUser, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-medium">Plano Atual:</span>
            <Badge variant="outline" className="capitalize">
              {adminUser?.plan_name || 'Teste Gratuito'}
            </Badge>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Email do usuário"
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

          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plano</FormLabel>
                <FormControl>
                  <Select 
                    value={field.value.toString()} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Teste Gratuito (1 agente)</SelectItem>
                      <SelectItem value="1">Inicial (1 agente)</SelectItem>
                      <SelectItem value="2">Padrão (3 agentes)</SelectItem>
                      <SelectItem value="3">Premium (10 agentes)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
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
