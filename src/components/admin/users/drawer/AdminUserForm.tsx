
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { PasswordFields } from './PasswordFields';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminUser } from '@/hooks/admin/useAdminUsersList';

export interface AdminUserFormData {
  email: string;
  password?: string;
  confirmPassword?: string;
  admin_level: string;
  plan: number;
}

interface AdminUserFormProps {
  adminUser: AdminUser | null;
  isUpdating: boolean;
  showPasswordFields: boolean;
  handlePasswordToggle: () => void;
  onSubmit: (data: AdminUserFormData) => void;
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
  
  // Define form schema
  const formSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
    password: showPasswordFields 
      ? z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
      : z.string().optional(),
    confirmPassword: showPasswordFields 
      ? z.string().min(6, { message: "Confirme a senha" })
      : z.string().optional(),
    admin_level: z.string().min(1, { message: "Nível administrativo é obrigatório" }),
    plan: z.number(),
  }).refine(data => {
    if (showPasswordFields) {
      return data.password === data.confirmPassword;
    }
    return true;
  }, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

  // Setup form
  const { control, handleSubmit, formState: { errors } } = useForm<AdminUserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: adminUser?.email || '',
      admin_level: adminUser?.admin_level || 'standard',
      plan: adminUser?.plan || 0,
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input 
              id="email" 
              {...field} 
              type="email" 
              placeholder="admin@example.com" 
              disabled={isUpdating || isCurrentAdmin}
              className={errors.email ? "border-red-500" : ""}
            />
          )}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password Toggle */}
      {!isCurrentAdmin && (
        <div className="flex items-center space-x-2">
          <Switch 
            id="password-toggle" 
            checked={showPasswordFields} 
            onCheckedChange={handlePasswordToggle} 
            disabled={isUpdating}
          />
          <Label htmlFor="password-toggle">
            {showPasswordFields ? "Desativar alteração de senha" : "Ativar alteração de senha"}
          </Label>
        </div>
      )}

      {/* Password Fields (conditional) */}
      {showPasswordFields && !isCurrentAdmin && (
        <PasswordFields 
          control={control as any}
          errors={errors}
          disabled={isUpdating}
        />
      )}

      <Separator />

      {/* Admin Level Select (conditional) */}
      <div className="space-y-2">
        <Label htmlFor="admin_level">Nível de Administrador</Label>
        <Controller
          name="admin_level"
          control={control}
          render={({ field }) => (
            <Select 
              disabled={!canEditAdminLevel || isUpdating || isCurrentAdmin}
              value={field.value} 
              onValueChange={field.onChange}
            >
              <SelectTrigger id="admin_level" className={errors.admin_level ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                {canEditAdminLevel && (
                  <SelectItem value="master">Master</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.admin_level && (
          <p className="text-sm text-red-500">{errors.admin_level.message}</p>
        )}
      </div>

      {/* Plan Select */}
      <div className="space-y-2">
        <Label htmlFor="plan">Plano</Label>
        <Controller
          name="plan"
          control={control}
          render={({ field }) => (
            <Select 
              disabled={isUpdating}
              value={String(field.value)} 
              onValueChange={(value) => field.onChange(parseInt(value, 10))}
            >
              <SelectTrigger id="plan">
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Teste Gratuito</SelectItem>
                <SelectItem value="1">Inicial</SelectItem>
                <SelectItem value="2">Padrão</SelectItem>
                <SelectItem value="3">Premium</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? 'Atualizando...' : 'Salvar Alterações'}
      </Button>
    </form>
  );
}
