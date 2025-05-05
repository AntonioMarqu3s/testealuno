import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckIcon, ExternalLinkIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase";

interface PlanSelectorProps {
  selectedPlan: number;
  onSelectPlan: (planId: number) => void;
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
  const [planos, setPlanos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPlanos() {
      const { data } = await supabase.from('planos').select('*').order('id', { ascending: true });
      setPlanos(data || []);
    }
    fetchPlanos();
  }, []);

  const handlePaymentClick = (planId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Aqui você pode abrir o link de pagamento real do plano, se existir
    // window.open(PAYMENT_LINKS[planId], '_blank');
  };

  return (
    <div className="space-y-3">
      <Label className="text-base">Selecione um Plano</Label>
      <RadioGroup
        defaultValue={String(selectedPlan)}
        value={String(selectedPlan)}
        onValueChange={(value) => onSelectPlan(Number(value))}
        className="grid gap-3"
      >
        {planos.map((plano) => (
          <Label
            key={plano.id}
            htmlFor={`plano-${plano.id}`}
            className={`flex cursor-pointer items-center rounded-lg border p-4 
              ${selectedPlan === plano.id ? 'border-primary bg-primary/10' : 'hover:bg-accent'}
            `}
          >
            <RadioGroupItem value={String(plano.id)} id={`plano-${plano.id}`} className="mr-3" />
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">{plano.nome}</span>
                <span className="font-medium">R$ {Number(plano.valor).toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Até {plano.agentes} agentes</p>
            </div>
            {plano.recomendado && (
              <Badge className="ml-2 bg-orange-500">
                <CheckIcon className="h-3 w-3 mr-1" />
                Recomendado
              </Badge>
            )}
            {showPaymentButtons && (
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-2"
                onClick={(e) => handlePaymentClick(plano.id, e)}
              >
                <ExternalLinkIcon className="h-4 w-4 mr-1" /> Assinar
              </Button>
            )}
          </Label>
        ))}
      </RadioGroup>
      {showTrialInfo && promoApplied && (
        <p className="text-sm text-green-600">
          Com o código promocional você terá 5 dias de teste gratuito do plano básico.
        </p>
      )}
    </div>
  );
}
