
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface FormNavigationProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
  isEditing?: boolean;
  isNextDisabled?: boolean;
}

const FormNavigation = ({
  step,
  totalSteps,
  onBack,
  onNext,
  isSubmitting,
  isEditing = false,
  isNextDisabled = false
}: FormNavigationProps) => {
  const isFirstStep = step === 1;
  const isLastStep = step === totalSteps;

  return (
    <div className="flex justify-between pt-4">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={isFirstStep}
        className={isFirstStep ? "invisible" : ""}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      {isLastStep ? (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : isEditing ? "Atualizar Agente" : "Criar Agente"}
        </Button>
      ) : (
        <Button type="button" onClick={onNext} disabled={isNextDisabled}>
          Continuar <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default FormNavigation;
