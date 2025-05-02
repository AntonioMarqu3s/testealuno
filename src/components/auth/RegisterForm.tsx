
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { updateCurrentUserEmail } from "@/services/user/userService";
import { PlanType, updateUserPlan } from "@/services/plan/userPlanService";
import { PlanSelector } from "./PlanSelector";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface RegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  onSuccessfulAuth: () => void;
  onShowConnectionError: (errorDetails: string) => void;
  handleDemoLogin: () => void;
  onSwitchToLogin: () => void;
}

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  promoCode: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({
  email,
  setEmail,
  isLoading,
  setIsLoading,
  onSuccessfulAuth,
  onShowConnectionError,
  handleDemoLogin,
  onSwitchToLogin
}: RegisterFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(PlanType.FREE_TRIAL);
  const [promoApplied, setPromoApplied] = useState<boolean>(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: email,
      password: "",
      confirmPassword: "",
      promoCode: ""
    }
  });

  const checkPromoCode = (code: string): boolean => {
    // Convert to uppercase for case-insensitive comparison
    const normalizedCode = code.toUpperCase();
    return normalizedCode === "OFERTAMDF";
  };

  const handleApplyPromoCode = () => {
    const promoCode = form.getValues("promoCode");
    if (promoCode && checkPromoCode(promoCode)) {
      setPromoApplied(true);
      toast.success("Código promocional aplicado com sucesso!", {
        description: "Você receberá 5 dias de teste gratuito."
      });
    } else if (promoCode) {
      toast.error("Código promocional inválido");
    }
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);

    try {
      console.log(`Attempting to register with email: ${values.email}`);
      
      // Users without valid promo code always get FREE_TRIAL plan without trial days
      const planToApply = PlanType.FREE_TRIAL;
      
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`,
          data: {
            email: values.email,
            plan: planToApply,
            promoCode: values.promoCode ? values.promoCode.toUpperCase() : null
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        
        if (error.message.includes('fetch') || error.message === 'Failed to fetch') {
          onShowConnectionError(`Erro de conexão: ${error.message}`);
          throw error;
        }
        throw error;
      }

      console.log('Registration successful:', data);
      
      // Update user email
      updateCurrentUserEmail(values.email);
      
      // Update user plan based on selection or promo code
      updateUserPlan(values.email, planToApply);
      
      // Success message - different messages based on promo code
      toast.success("Conta criada com sucesso!", { 
        description: promoApplied 
          ? "Seu período de teste gratuito de 5 dias foi iniciado."
          : "Sua conta foi criada. Por favor, faça upgrade para um plano pago para começar a usar."
      });
      
      onSuccessfulAuth();
    } catch (error: any) {
      if (error.message?.includes('User already registered')) {
        toast.error("Este email já está registrado");
        onSwitchToLogin();
      } else {
        toast.error(error.message || "Ocorreu um erro durante a autenticação.");
      }
      console.error("Auth error details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="space-y-4">
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
                      onClick={handleApplyPromoCode}
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
          
          <PlanSelector 
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            showTrialInfo={promoApplied}
            promoApplied={promoApplied}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Criando conta..." : "Criar conta"}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            className="w-full mt-2"
            onClick={handleDemoLogin}
          >
            Modo de Demonstração
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
