import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { updateCurrentUserEmail } from "@/services/user/userService";
import { PlanType, updateUserPlan } from "@/services/plan/userPlanService";
import { updateUserPlanInSupabase } from "@/services/plan/supabase/planTypeService";
import { registerSchema, RegisterFormValues } from "../forms/RegisterFormFields";
import { checkPromoCode } from "../utils/promoCodeUtils";

interface UseRegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  onSuccessfulAuth: () => void;
  onShowConnectionError: (errorDetails: string) => void;
  onSwitchToLogin: () => void;
}

export function useRegisterForm({
  email,
  setEmail,
  isLoading,
  setIsLoading,
  onSuccessfulAuth,
  onShowConnectionError,
  onSwitchToLogin
}: UseRegisterFormProps) {
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
      
      // Determine plan type based on promo code
      // If promo code OFERTAMDF is applied, set plan to 1 (BASIC)
      // otherwise set to 0 (FREE_TRIAL without trial days)
      const planToApply = promoApplied ? PlanType.BASIC : PlanType.FREE_TRIAL;
      
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`,
          data: {
            email: values.email,
            plan: planToApply,
            promoCode: values.promoCode ? values.promoCode.toUpperCase() : null,
            hasPromoCode: promoApplied
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
      
      // Calculate trial end date (5 days from now) if promo code is applied
      let trialEndDate;
      if (promoApplied) {
        trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 5);
      }
      
      // Explicitly update user plan in Supabase with a retry mechanism
      if (data.user) {
        try {
          // First attempt
          await updateUserPlanInSupabase(data.user.id, planToApply);
          console.log('Plan updated in Supabase successfully');
        } catch (planError) {
          console.error('First attempt to update plan failed:', planError);
          
          // Wait a moment and retry once more
          setTimeout(async () => {
            try {
              await updateUserPlanInSupabase(data.user.id, planToApply);
              console.log('Plan updated in Supabase after retry');
            } catch (retryError) {
              console.error('Retry to update plan also failed:', retryError);
            }
          }, 2000);
        }
      }
      
      // Also update in local storage for compatibility
      updateUserPlan(
        values.email,
        planToApply,
        undefined,
        undefined,
        undefined,
        promoApplied
      );
      
      // Success message - different messages based on promo code
      toast.success("Conta criada com sucesso!", { 
        description: promoApplied 
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

  return {
    form,
    selectedPlan,
    setSelectedPlan,
    promoApplied,
    setPromoApplied,
    handleApplyPromoCode,
    handleSubmit
  };
}
