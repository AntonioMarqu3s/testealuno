import React, { useEffect } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { UserData, UserFormData } from "@/hooks/admin/useUserDetailDrawer";
import { Button } from "@/components/ui/button";
import { PasswordFields } from "./PasswordFields";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional(),
  confirmPassword: z.string().optional()
}).refine(data => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

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
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: userData?.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  // Reset form when userData changes
  useEffect(() => {
    if (userData) {
      form.reset({
        email: userData.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [userData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
                    disabled={isUpdating}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handlePasswordToggle}
              disabled={isUpdating}
            >
              {showPasswordFields ? "Cancelar Alteração de Senha" : "Alterar Senha"}
            </Button>
          </div>
          
          {showPasswordFields && (
            <PasswordFields control={form.control} disabled={isUpdating} />
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
