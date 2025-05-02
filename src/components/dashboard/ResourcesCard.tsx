
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ResourcesCardProps {
  userAgentsCount: number;
  agentLimit: number;
  planName: string;
  isTrialPlan: boolean;
  isTrialExpired: boolean;
  isSubscriptionExpired?: boolean;
  trialDaysRemaining: number;
  onUpgrade: () => void;
}

export const ResourcesCard = ({
  userAgentsCount,
  agentLimit,
  planName,
  isTrialPlan,
  isTrialExpired,
  isSubscriptionExpired = false,
  trialDaysRemaining,
  onUpgrade
}: ResourcesCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Recursos Disponíveis</CardTitle>
        <CardDescription>Recursos incluídos no seu plano atual</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-2">
          <span>Agentes criados</span>
          <span className="font-medium">{userAgentsCount} / {agentLimit}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Usuários</span>
          <span className="font-medium">1 / 1</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Automações</span>
          <span className="font-medium">0 / 2</span>
        </div>
        <Separator className="my-2" />
        <div className="flex items-center justify-between py-2">
          <span>Plano atual</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{planName}</span>
            {isTrialPlan && (
              <Badge variant={isTrialExpired ? "destructive" : "outline"} className="text-xs">
                {isTrialExpired ? "Expirado" : `${trialDaysRemaining} dias restantes`}
              </Badge>
            )}
            {!isTrialPlan && isSubscriptionExpired && (
              <Badge variant="destructive" className="text-xs">
                Assinatura expirada
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onUpgrade}>
          {isTrialPlan && isTrialExpired ? "Ativar plano" : 
           isSubscriptionExpired ? "Renovar assinatura" : "Fazer upgrade"}
        </Button>
      </CardFooter>
    </Card>
  );
};
