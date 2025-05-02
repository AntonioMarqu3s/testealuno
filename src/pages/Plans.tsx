
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserEmail } from "@/services/user/userService";
import { PlanType, PLAN_DETAILS, getUserPlan } from "@/services/plan/userPlanService";
import { PlanCard, PAYMENT_LINKS } from "@/components/plan/PlanCard";

const Plans = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = getCurrentUserEmail();
  const userPlan = getUserPlan(userEmail);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  // Prevent infinite redirects by checking if we're coming from a specific path
  const fromPath = location.state?.from;

  const handleSelectPlan = (planType: PlanType) => {
    setSelectedPlan(planType);
    window.open(PAYMENT_LINKS[planType], '_blank');
  };

  // Check if user has a valid promo code
  const hasPromoCode = () => {
    // This could be expanded in the future to check from user metadata/profile
    // For now, just assumes the promo is applied through registration
    return false;
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
          {/* Use the PlanCard component for each plan - only show trial days if promo applied */}
          <PlanCard 
            planType={PlanType.BASIC} 
            current={userPlan.plan === PlanType.BASIC}
            selected={selectedPlan === PlanType.BASIC}
            onSelect={() => handleSelectPlan(PlanType.BASIC)}
            showTrialDays={hasPromoCode()}
            showBuyButton={true}
          />
          
          <PlanCard 
            planType={PlanType.STANDARD} 
            current={userPlan.plan === PlanType.STANDARD}
            selected={selectedPlan === PlanType.STANDARD}
            onSelect={() => handleSelectPlan(PlanType.STANDARD)}
            recommended={true}
            showBuyButton={true}
          />
          
          <PlanCard 
            planType={PlanType.PREMIUM} 
            current={userPlan.plan === PlanType.PREMIUM}
            selected={selectedPlan === PlanType.PREMIUM}
            onSelect={() => handleSelectPlan(PlanType.PREMIUM)}
            showBuyButton={true}
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
                Novos usuários que se registram com código promocional recebem um período de teste gratuito de 5 dias 
                com acesso às funcionalidades do plano básico.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Add button to return to dashboard */}
        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Voltar para o dashboard
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Plans;
