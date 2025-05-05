interface PlanSelectorProps {
  selectedPlan: any;
  onSelectPlan: (plan: any) => void;
  showTrialInfo?: boolean;
  promoApplied?: boolean;
  showPaymentButtons?: boolean;
}

export function PlanSelector({ 
  selectedPlan, 
  onSelectPlan, 
  showTrialInfo = false,
  promoApplied = false,
  showPaymentButtons = false
}: PlanSelectorProps) {
  // Retorna um container vazio para remover a seção de seleção de planos
  return (
    <></>
  );
}
