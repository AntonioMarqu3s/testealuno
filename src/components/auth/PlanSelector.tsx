
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PlanType } from "@/services/plan/userPlanService";

interface PlanSelectorProps {
  selectedPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
}

export function PlanSelector({ selectedPlan, onSelectPlan }: PlanSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Selecione seu plano</Label>
      <RadioGroup 
        value={selectedPlan.toString()} 
        onValueChange={(value) => onSelectPlan(parseInt(value) as PlanType)}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className={`relative flex flex-col p-4 rounded-lg border ${selectedPlan === PlanType.BASIC ? 'bg-primary/5 border-primary' : 'border-border'}`}>
          <RadioGroupItem 
            value={PlanType.BASIC.toString()} 
            id="basic-plan" 
            className="absolute right-4 top-4"
          />
          <Label htmlFor="basic-plan" className="font-semibold">Iniciante</Label>
          <p className="text-sm text-muted-foreground">1 Agente</p>
          <p className="mt-1 text-sm font-medium">R$ 97,00/mês</p>
        </div>

        <div className={`relative flex flex-col p-4 rounded-lg border ${selectedPlan === PlanType.STANDARD ? 'bg-primary/5 border-primary' : 'border-border'}`}>
          <span className="absolute -top-2 -right-2 px-2 py-1 text-xs font-semibold rounded-full bg-orange-500 text-white">
            Recomendado
          </span>
          <RadioGroupItem 
            value={PlanType.STANDARD.toString()} 
            id="standard-plan" 
            className="absolute right-4 top-4"
          />
          <Label htmlFor="standard-plan" className="font-semibold">Intermediário</Label>
          <p className="text-sm text-muted-foreground">3 Agentes</p>
          <p className="mt-1 text-sm font-medium">R$ 210,00/mês</p>
        </div>

        <div className={`relative flex flex-col p-4 rounded-lg border ${selectedPlan === PlanType.PREMIUM ? 'bg-primary/5 border-primary' : 'border-border'}`}>
          <RadioGroupItem 
            value={PlanType.PREMIUM.toString()} 
            id="premium-plan" 
            className="absolute right-4 top-4"
          />
          <Label htmlFor="premium-plan" className="font-semibold">Premium</Label>
          <p className="text-sm text-muted-foreground">10 Agentes</p>
          <p className="mt-1 text-sm font-medium">R$ 700,00/mês</p>
        </div>
      </RadioGroup>
    </div>
  );
}
