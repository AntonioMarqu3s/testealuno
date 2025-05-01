
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PlanType, PLAN_DETAILS } from "@/services/plan/userPlanService";
import { Check } from "lucide-react";
import { Badge } from "../ui/badge";

interface PlanSelectorProps {
  selectedPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
  showTrialInfo?: boolean;
}

export function PlanSelector({ 
  selectedPlan, 
  onSelectPlan,
  showTrialInfo = false
}: PlanSelectorProps) {
  // Format price to BRL
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label>Selecione um Plano</Label>
      </div>
      <RadioGroup
        value={selectedPlan.toString()}
        onValueChange={(value) => onSelectPlan(parseInt(value) as PlanType)}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <div
          className={`relative flex flex-col rounded-lg border p-4 ${
            selectedPlan === PlanType.FREE_TRIAL ? "border-primary ring-2 ring-primary" : "border-input"
          }`}
        >
          <RadioGroupItem
            value={PlanType.FREE_TRIAL.toString()}
            id="plan-free-trial"
            className="sr-only"
          />
          <Label
            htmlFor="plan-free-trial"
            className="flex flex-1 cursor-pointer flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">
                {PLAN_DETAILS[PlanType.FREE_TRIAL].name}
              </span>
              {showTrialInfo && (
                <Badge variant="secondary" className="ml-2">
                  {PLAN_DETAILS[PlanType.FREE_TRIAL].trialDays} dias
                </Badge>
              )}
            </div>
            <span className="text-2xl font-bold">
              {formatPrice(PLAN_DETAILS[PlanType.FREE_TRIAL].price)}
            </span>
            <span className="text-sm text-muted-foreground">
              Até {PLAN_DETAILS[PlanType.FREE_TRIAL].agentLimit} agente
            </span>
          </Label>
          {selectedPlan === PlanType.FREE_TRIAL && (
            <Check className="absolute right-4 top-4 h-5 w-5 text-primary" />
          )}
        </div>
        
        <div
          className={`relative flex flex-col rounded-lg border p-4 ${
            selectedPlan === PlanType.BASIC ? "border-primary ring-2 ring-primary" : "border-input"
          }`}
        >
          <RadioGroupItem
            value={PlanType.BASIC.toString()}
            id="plan-basic"
            className="sr-only"
          />
          <Label
            htmlFor="plan-basic"
            className="flex flex-1 cursor-pointer flex-col gap-2"
          >
            <span className="text-base font-semibold">
              {PLAN_DETAILS[PlanType.BASIC].name}
            </span>
            <span className="text-2xl font-bold">
              {formatPrice(PLAN_DETAILS[PlanType.BASIC].price)}
            </span>
            <span className="text-sm text-muted-foreground">
              Até {PLAN_DETAILS[PlanType.BASIC].agentLimit} agente
            </span>
          </Label>
          {selectedPlan === PlanType.BASIC && (
            <Check className="absolute right-4 top-4 h-5 w-5 text-primary" />
          )}
        </div>
        
        <div
          className={`relative flex flex-col rounded-lg border p-4 ${
            selectedPlan === PlanType.STANDARD ? "border-primary ring-2 ring-primary" : "border-input"
          }`}
        >
          <RadioGroupItem
            value={PlanType.STANDARD.toString()}
            id="plan-standard"
            className="sr-only"
          />
          <Label
            htmlFor="plan-standard"
            className="flex flex-1 cursor-pointer flex-col gap-2"
          >
            <span className="text-base font-semibold">
              {PLAN_DETAILS[PlanType.STANDARD].name}
            </span>
            <span className="text-2xl font-bold">
              {formatPrice(PLAN_DETAILS[PlanType.STANDARD].price)}
            </span>
            <span className="text-sm text-muted-foreground">
              Até {PLAN_DETAILS[PlanType.STANDARD].agentLimit} agentes
            </span>
          </Label>
          {selectedPlan === PlanType.STANDARD && (
            <Check className="absolute right-4 top-4 h-5 w-5 text-primary" />
          )}
        </div>

        <div
          className={`relative flex flex-col rounded-lg border p-4 ${
            selectedPlan === PlanType.PREMIUM ? "border-primary ring-2 ring-primary" : "border-input"
          }`}
        >
          <RadioGroupItem
            value={PlanType.PREMIUM.toString()}
            id="plan-premium"
            className="sr-only"
          />
          <Label
            htmlFor="plan-premium"
            className="flex flex-1 cursor-pointer flex-col gap-2"
          >
            <span className="text-base font-semibold">
              {PLAN_DETAILS[PlanType.PREMIUM].name}
            </span>
            <span className="text-2xl font-bold">
              {formatPrice(PLAN_DETAILS[PlanType.PREMIUM].price)}
            </span>
            <span className="text-sm text-muted-foreground">
              Até {PLAN_DETAILS[PlanType.PREMIUM].agentLimit} agentes
            </span>
          </Label>
          {selectedPlan === PlanType.PREMIUM && (
            <Check className="absolute right-4 top-4 h-5 w-5 text-primary" />
          )}
        </div>
      </RadioGroup>
      
      {showTrialInfo && selectedPlan === PlanType.FREE_TRIAL && (
        <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded-md">
          <p>O teste gratuito inclui acesso a todas as funcionalidades por {PLAN_DETAILS[PlanType.FREE_TRIAL].trialDays} dias.</p>
        </div>
      )}
    </div>
  );
}
