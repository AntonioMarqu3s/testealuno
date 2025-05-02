import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon } from "lucide-react";
import { getCurrentUserEmail } from "@/services/user/userService";
import { PlanType, PLAN_DETAILS, getUserPlan } from "@/services/plan/userPlanService";
import { upgradeToPlan } from "@/services/checkout/checkoutService";
import { toast } from "sonner";
import { PlanCard } from "@/components/plan/PlanCard";

const Plans = () => {
  const navigate = useNavigate();
  const userEmail = getCurrentUserEmail();
  const userPlan = getUserPlan(userEmail);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = (planType: PlanType) => {
    setSelectedPlan(planType);
    navigate(`/plan-checkout?plan=${planType}`);
  };

  return (
    <MainLayout title="Planos de Assinatura">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planos de Assinatura</h2>
          <p className="text-muted-foreground">
            Escolha o plano ideal para suas necessidades e comece a criar agentes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Use the PlanCard component for each plan */}
          <PlanCard 
            planType={PlanType.BASIC} 
            current={userPlan.plan === PlanType.BASIC}
            selected={selectedPlan === PlanType.BASIC}
            onSelect={() => handleSelectPlan(PlanType.BASIC)}
            showTrialDays={true}
          />
          
          <PlanCard 
            planType={PlanType.STANDARD} 
            current={userPlan.plan === PlanType.STANDARD}
            selected={selectedPlan === PlanType.STANDARD}
            onSelect={() => handleSelectPlan(PlanType.STANDARD)}
            recommended={true}
          />
          
          <PlanCard 
            planType={PlanType.PREMIUM} 
            current={userPlan.plan === PlanType.PREMIUM}
            selected={selectedPlan === PlanType.PREMIUM}
            onSelect={() => handleSelectPlan(PlanType.PREMIUM)}
          />
        </div>

        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">O que está incluído nos planos?</h3>
              <p className="text-sm text-muted-foreground">
                Todos os planos incluem acesso à nossa plataforma para criar e gerenciar agentes de IA. 
                A quantidade de agentes e recursos disponíveis varia de acordo com o plano escolhido.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Posso mudar de plano depois?</h3>
              <p className="text-sm text-muted-foreground">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                As mudanças entram em vigor imediatamente.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Como funciona o período de teste?</h3>
              <p className="text-sm text-muted-foreground">
                Novos usuários recebem automaticamente um período de teste gratuito de 3 dias 
                com acesso às funcionalidades do plano básico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Plans;
