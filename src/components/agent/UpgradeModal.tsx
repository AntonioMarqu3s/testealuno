
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { PLAN_DETAILS, PlanType, getPlanPrice } from "@/services/plan/userPlanService";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

export const UpgradeModal = ({ open, onOpenChange, onUpgrade }: UpgradeModalProps) => {
  const navigate = useNavigate();
  
  const handleUpgradeClick = () => {
    onOpenChange(false);
    navigate('/plan-checkout');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Faça upgrade para um plano pago</DialogTitle>
          <DialogDescription>
            O plano gratuito permite apenas 1 agente. Escolha um plano pago para criar mais agentes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            {[PlanType.BASIC, PlanType.STANDARD, PlanType.PREMIUM].map((planType) => (
              <div key={planType} className="flex justify-between items-center p-3 rounded-lg border hover:border-primary cursor-pointer transition-all">
                <div>
                  <h4 className="font-medium">{PLAN_DETAILS[planType].name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {PLAN_DETAILS[planType].agentLimit} {PLAN_DETAILS[planType].agentLimit === 1 ? 'agente' : 'agentes'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{getPlanPrice(planType)}</div>
                  <div className="text-xs text-muted-foreground">por mês</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-center text-center text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 mr-1" /> Pagamento seguro e cancelamento a qualquer momento
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <Button variant="outline" className="sm:flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="sm:flex-1" onClick={handleUpgradeClick}>
            <CreditCard className="mr-2 h-4 w-4" /> Ver planos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
