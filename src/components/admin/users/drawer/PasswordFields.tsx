
import React from "react";
import { Card } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { AdminUserFormData } from "./AdminUserForm";

interface PasswordFieldsProps {
  control: Control<AdminUserFormData>;
}

export function PasswordFields({ control }: PasswordFieldsProps) {
  return (
    <Card className="p-4 space-y-4">
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
  );
}
