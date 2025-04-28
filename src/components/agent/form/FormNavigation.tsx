
import { Button } from "@/components/ui/button";

interface FormNavigationProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
}

const FormNavigation = ({
  step,
  totalSteps,
  onBack,
  onNext,
  isSubmitting,
}: FormNavigationProps) => {
  const isLastStep = step === totalSteps;

  return (
    <div className="flex justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={step === 1}
      >
        Voltar
      </Button>
      {!isLastStep ? (
        <Button type="button" onClick={onNext}>
          Próximo
        </Button>
      ) : (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando Agente..." : "Criar Agente"}
        </Button>
      )}
    </div>
  );
};

export default FormNavigation;
