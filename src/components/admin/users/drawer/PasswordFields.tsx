import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { UserFormData } from "@/hooks/admin/useUserDetailDrawer";

// Generic interface that works with both user and admin forms
interface PasswordFieldsProps {
  control: Control<UserFormData>;
  disabled?: boolean;
}

export function PasswordFields({ control, disabled }: PasswordFieldsProps) {
  return (
    <div className="space-y-4">
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
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
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
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
