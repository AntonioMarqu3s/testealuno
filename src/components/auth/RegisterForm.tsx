
import { CardContent, CardFooter } from "@/components/ui/card";
import { PlanType } from "@/services/plan/userPlanService";
import { useRegisterForm } from "./hooks/useRegisterForm";
import { RegisterFormFields } from "./forms/RegisterFormFields";

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
  const {
    form,
    selectedPlan,
    setSelectedPlan,
    promoApplied,
    handleApplyPromoCode,
    handleSubmit
  } = useRegisterForm({
    email,
    setEmail,
    isLoading,
    setIsLoading,
    onSuccessfulAuth,
    onShowConnectionError,
    onSwitchToLogin
  });

  return (
    <>
      <CardContent className="p-0">
        <RegisterFormFields
          form={form}
          isLoading={isLoading}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          promoApplied={promoApplied}
          setPromoApplied={() => {}}
          onApplyPromoCode={handleApplyPromoCode}
          onSubmit={handleSubmit}
          setEmail={setEmail}
        />
      </CardContent>
    </>
  );
}
