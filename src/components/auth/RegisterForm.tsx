import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { updateCurrentUserEmail } from "@/services/user/userService";
import { PlanType, updateUserPlan } from "@/services/plan/userPlanService";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PromoCodeInput } from "./PromoCodeInput";
import { RegisterFormValues, registerSchema } from "./RegisterFormSchema";
import { PlanSelectorV2 } from "./PlanSelectorV2";

interface RegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  onSuccessfulAuth: () => void;
  onShowConnectionError: (errorDetails: string) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({
  email,
  setEmail,
  isLoading,
  setIsLoading,
  onSuccessfulAuth,
  onShowConnectionError,
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

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);

    try {
      console.log(`Attempting to register with email: ${values.email}`);
      
      // Get trial info
      const hasValidPromo = values.promoCode && checkPromoCode(values.promoCode);
      
      // All users get the FREE_TRIAL plan
      const planToApply = PlanType.FREE_TRIAL;
      
      // Calculate trial end date if it's a valid promo code
      let trialEndsAt = null;
      if (hasValidPromo) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 5); // 5 days trial
        trialEndsAt = trialEnd.toISOString();
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`,
          data: {
            email: values.email,
            plan: planToApply,
            promoCode: values.promoCode ? values.promoCode.toUpperCase() : null,
            trialEndsAt: trialEndsAt,
            trialInit: new Date().toISOString()
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
      
      // Update user plan based on selection and promo code
      updateUserPlan(
        values.email, 
        planToApply, 
        undefined, 
        undefined, 
        undefined, 
        hasValidPromo
      );
      
      // Novo: inserir usuário na tabela public.users
      if (data?.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            nome: values.nome || '',
            telefone: values.telefone || '',
            empresa_nome: '',
            empresa_dados: '',
            script: '',
            google_docs_id: '',
            google_sheet_id: '',
            objecoes: '',
            faqs: '',
            instancia_nome: '',
            instancia_telefone: '',
            plano_id: planToApply,
            plano_nome: 'Teste Gratuito',
            plano_valor: 0,
            plano_status: 'trial',
            data_pagamento: null,
            data_expiracao: null,
            agentes_limite: 1,
            conect: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        if (userError) {
          toast.error('Erro ao criar dados extras do usuário: ' + userError.message);
          return;
        }
      }
      
      // Success message - different messages based on promo code
      toast.success("Conta criada com sucesso!", { 
        description: hasValidPromo 
          ? "Seu período de teste gratuito de 5 dias foi iniciado."
          : "Sua conta foi criada. Por favor, verifique seu email para confirmar seu cadastro." 
      });
      
      // Short delay to show the toast before navigation
      setTimeout(() => {
        onSuccessfulAuth();
      }, 1500);
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
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Seu nome completo" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" placeholder="(99) 99999-9999" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <EmailPasswordFields form={form} setEmail={setEmail} />
          
          <div className="space-y-2">
            <PromoCodeInput 
              form={form} 
              promoApplied={promoApplied} 
              setPromoApplied={setPromoApplied} 
              checkPromoCode={checkPromoCode} 
            />
          </div>
          
          <PlanSelectorV2 
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            showTrialInfo={promoApplied}
            promoApplied={promoApplied}
          />
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Criando conta..." : "Criar conta"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}

// Extracted component for email and password fields
interface EmailPasswordFieldsProps {
  form: ReturnType<typeof useForm<RegisterFormValues>>;
  setEmail: (email: string) => void;
}

function EmailPasswordFields({ form, setEmail }: EmailPasswordFieldsProps) {
  return (
    <>
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
    </>
  );
}
