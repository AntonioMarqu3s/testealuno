
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlanSelector } from "../PlanSelector";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  promoCode: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
  isLoading: boolean;
  selectedPlan: number;
  setSelectedPlan: (plan: number) => void;
  promoApplied: boolean;
  setPromoApplied: (applied: boolean) => void;
  onApplyPromoCode: () => void;
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  setEmail: (email: string) => void;
}

export function RegisterFormFields({
  form,
  isLoading,
  selectedPlan,
  setSelectedPlan,
  promoApplied,
  onApplyPromoCode,
  onSubmit,
  setEmail
}: RegisterFormFieldsProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4 px-4 py-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    placeholder="seu@email.com" 
                    onChange={(e) => {
                      field.onChange(e);
                      setEmail(e.target.value);
                    }}
                    required 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="password"
                    placeholder="Sua senha segura"
                    required 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    type="password"
                    placeholder="Confirme sua senha"
                    required 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <PromoCodeField 
            form={form}
            promoApplied={promoApplied}
            onApplyPromoCode={onApplyPromoCode}
          />
          
          <PlanSelector 
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            showTrialInfo={promoApplied}
            promoApplied={promoApplied}
          />
        </div>
        
        <div className="px-4 py-3 border-t">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Criando conta..." : "Criar conta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface PromoCodeFieldProps {
  form: UseFormReturn<RegisterFormValues>;
  promoApplied: boolean;
  onApplyPromoCode: () => void;
}

function PromoCodeField({ form, promoApplied, onApplyPromoCode }: PromoCodeFieldProps) {
  return (
    <div className="space-y-2">
      <FormField
        control={form.control}
        name="promoCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código Promocional</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input 
                  {...field}
                  placeholder="Código promocional (opcional)"
                  className={promoApplied ? "border-green-500 text-green-600" : ""}
                  disabled={promoApplied}
                />
              </FormControl>
              <Button 
                type="button" 
                variant={promoApplied ? "outline" : "secondary"}
                onClick={onApplyPromoCode}
                disabled={!field.value || promoApplied}
                className={promoApplied ? "border-green-500 text-green-600" : ""}
              >
                {promoApplied ? "Aplicado" : "Aplicar"}
              </Button>
            </div>
            {promoApplied && (
              <p className="text-sm text-green-600 mt-1">
                Código promocional válido! 5 dias de teste gratuito.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
