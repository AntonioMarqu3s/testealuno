
import React from "react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { UserData, UserFormData } from "@/hooks/admin/useUserDetailDrawer";
import { Button } from "@/components/ui/button";
import { PasswordFields } from "./PasswordFields";

interface UserFormProps {
  userData: UserData | null;
  isUpdating: boolean;
  showPasswordFields: boolean;
  handlePasswordToggle: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
}

export function UserForm({
  userData,
  isUpdating,
  showPasswordFields,
  handlePasswordToggle,
  onSubmit
}: UserFormProps) {
  const form = useForm<UserFormData>({
    defaultValues: {
      email: userData?.email || "",
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
                    placeholder="Email do usuário"
                    {...field}
                  />
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
