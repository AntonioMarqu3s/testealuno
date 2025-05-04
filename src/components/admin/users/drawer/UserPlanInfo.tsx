
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Calendar, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserPlan } from "@/types/admin";

interface UserPlanInfoProps {
  plan?: UserPlan;
}

export function UserPlanInfo({ plan }: UserPlanInfoProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const getPlanName = (planId?: number) => {
    switch (planId) {
      case 0: return "Trial Gratuito";
      case 1: return "Básico";
      case 2: return "Standard";
      case 3: return "Premium";
      default: return "Desconhecido";
    }
  };

  if (!plan) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Plano</CardTitle>
          <CardDescription>Nenhum plano configurado</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Detalhes do Plano</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{plan.name || getPlanName(plan.plan)}</h3>
          </div>
          <Badge variant={plan.payment_status === 'completed' ? 'success' : 'destructive'}>
            {plan.payment_status === 'completed' ? 'Pago' : 'Pendente'}
          </Badge>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Limite de Agentes</p>
            <p className="font-medium">{plan.agent_limit || 1}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Connect Instancia</p>
            <div className="flex items-center gap-2">
              {plan.connect_instancia ? (
                <Badge variant="success" className="gap-1">
                  <Check className="h-3 w-3" />
                  Ativo
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <X className="h-3 w-3" />
                  Inativo
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Data de Pagamento</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(plan.payment_date)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Expiração</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(plan.subscription_ends_at)}</span>
            </div>
          </div>
        </div>
        
        {plan.trial_ends_at && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Término do Trial</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(plan.trial_ends_at)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
