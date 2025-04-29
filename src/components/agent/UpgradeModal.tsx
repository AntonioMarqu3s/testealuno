
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

export const UpgradeModal = ({ open, onOpenChange, onUpgrade }: UpgradeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Faça upgrade para o plano Premium</DialogTitle>
          <DialogDescription>
            O plano básico permite apenas 1 agente. Upgrade para o plano Premium para criar agentes ilimitados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg border p-4 mb-4">
            <h4 className="font-medium mb-2">Plano Premium</h4>
            <ul className="space-y-1 text-sm">
              <li>✅ Agentes ilimitados</li>
              <li>✅ Funções avançadas de IA</li>
              <li>✅ Suporte prioritário</li>
              <li>✅ Integração com CRM</li>
            </ul>
            <p className="mt-4 font-bold text-lg">R$ 99,90/mês</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onUpgrade}>
            <CreditCard className="mr-2 h-4 w-4" /> Fazer upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
