
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckIcon, ExternalLinkIcon } from "lucide-react";
import { PlanType } from "@/services/plan/userPlanService";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { PAYMENT_LINKS } from "../plan/PlanCard";

interface PlanSelectorProps {
  selectedPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
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
  // Don't show the Free Trial option unless promo is applied
  const shouldShowFreeTrial = promoApplied;

  const handlePaymentClick = (planType: PlanType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(PAYMENT_LINKS[planType], '_blank');
  };

  return (
    <div className="space-y-3">
      <Label className="text-base">Selecione um Plano</Label>
      
      <RadioGroup
        defaultValue={String(selectedPlan)}
        value={String(selectedPlan)}
        onValueChange={(value) => onSelectPlan(Number(value) as PlanType)}
        className="grid gap-3"
      >
        {shouldShowFreeTrial && (
          <Label
            htmlFor="freetrial"
            className={`flex cursor-pointer items-center rounded-lg border p-4 
              ${selectedPlan === PlanType.FREE_TRIAL ? 'border-primary bg-primary/10' : 'hover:bg-accent'}
            `}
          >
            <RadioGroupItem value={String(PlanType.FREE_TRIAL)} id="freetrial" className="mr-3" />
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">Teste Gratuito</span>
                <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                  5 dias
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Comece a testar com 1 agente</p>
            </div>
          </Label>
        )}

        <Label
          htmlFor="basic"
          className={`flex cursor-pointer items-center rounded-lg border p-4 
            ${selectedPlan === PlanType.BASIC ? 'border-primary bg-primary/10' : 'hover:bg-accent'}
          `}
        >
          <RadioGroupItem value={String(PlanType.BASIC)} id="basic" className="mr-3" />
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Inicial</span>
              <span className="font-medium">R$ 97,00</span>
            </div>
            <p className="text-sm text-muted-foreground">Até 1 agente</p>
          </div>
          {showPaymentButtons && (
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2"
              onClick={(e) => handlePaymentClick(PlanType.BASIC, e)}
            >
              <ExternalLinkIcon className="h-4 w-4 mr-1" /> Assinar
            </Button>
          )}
        </Label>

        <Label
          htmlFor="standard"
          className={`flex cursor-pointer items-center rounded-lg border p-4 
            ${selectedPlan === PlanType.STANDARD ? 'border-primary bg-primary/10' : 'hover:bg-accent'}
          `}
        >
          <RadioGroupItem value={String(PlanType.STANDARD)} id="standard" className="mr-3" />
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Padrão</span>
              <span className="font-medium">R$ 210,00</span>
            </div>
            <p className="text-sm text-muted-foreground">Até 3 agentes</p>
          </div>
          <Badge className="ml-2 bg-orange-500">
            <CheckIcon className="h-3 w-3 mr-1" />
            Recomendado
          </Badge>
          {showPaymentButtons && (
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2"
              onClick={(e) => handlePaymentClick(PlanType.STANDARD, e)}
            >
              <ExternalLinkIcon className="h-4 w-4 mr-1" /> Assinar
            </Button>
          )}
        </Label>

        <Label
          htmlFor="premium"
          className={`flex cursor-pointer items-center rounded-lg border p-4 
            ${selectedPlan === PlanType.PREMIUM ? 'border-primary bg-primary/10' : 'hover:bg-accent'}
          `}
        >
          <RadioGroupItem value={String(PlanType.PREMIUM)} id="premium" className="mr-3" />
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Premium</span>
              <span className="font-medium">R$ 700,00</span>
            </div>
            <p className="text-sm text-muted-foreground">Até 10 agentes</p>
          </div>
          {showPaymentButtons && (
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2"
              onClick={(e) => handlePaymentClick(PlanType.PREMIUM, e)}
            >
              <ExternalLinkIcon className="h-4 w-4 mr-1" /> Assinar
            </Button>
          )}
        </Label>
      </RadioGroup>

      {showTrialInfo && promoApplied && (
        <p className="text-sm text-green-600">
          Com o código promocional você terá 5 dias de teste gratuito do plano básico.
        </p>
      )}
    </div>
  );
}
