
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlanType } from "@/services/plan/planTypes";
import { updateUserPlanExternal } from "@/services/plan/planUpdateExternalService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

interface ManualPlanUpdateProps {
  userEmail: string;
  onUpdateComplete?: () => void;
}

export function ManualPlanUpdate({ userEmail, onUpdateComplete }: ManualPlanUpdateProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(PlanType.BASIC);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handlePlanUpdate = async () => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para atualizar o plano");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const result = await updateUserPlanExternal(
        user.id,
        userEmail,
        selectedPlan
      );
      
      if (result.success) {
        toast.success("Plano atualizado com sucesso!", {
          description: `Seu plano foi atualizado para ${result.plan?.name || "o novo plano"}.`,
        });
        
        if (onUpdateComplete) {
          onUpdateComplete();
        }
      } else {
        toast.error("Erro ao atualizar plano", {
          description: result.error || "Ocorreu um erro ao atualizar seu plano.",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      toast.error("Erro ao atualizar plano", {
        description: "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <h3 className="font-medium text-lg">Atualização Manual de Plano</h3>
      <p className="text-sm text-muted-foreground">
        Use esta ferramenta para forçar a atualização manual do plano.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">Selecione o Plano</label>
          <Select 
            value={String(selectedPlan)}
            onValueChange={(value) => setSelectedPlan(Number(value) as PlanType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(PlanType.FREE_TRIAL)}>Teste Gratuito</SelectItem>
              <SelectItem value={String(PlanType.BASIC)}>Inicial</SelectItem>
              <SelectItem value={String(PlanType.STANDARD)}>Padrão</SelectItem>
              <SelectItem value={String(PlanType.PREMIUM)}>Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handlePlanUpdate}
          disabled={isUpdating}
          className="w-full md:w-auto"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            "Atualizar Plano"
          )}
        </Button>
      </div>
    </div>
  );
}
