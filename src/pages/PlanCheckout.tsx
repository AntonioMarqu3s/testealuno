
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PlanCard, PAYMENT_LINKS } from "@/components/plan/PlanCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { getCurrentUserEmail } from "@/services/user/userService";
import { PlanType, PLAN_DETAILS, getTrialDaysRemaining, getUserPlan, hasTrialExpired } from "@/services/plan/userPlanService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";

const PlanCheckout = () => {
  const navigate = useNavigate();
  const userEmail = getCurrentUserEmail();
  const userPlan = getUserPlan(userEmail);
  const trialDaysLeft = getTrialDaysRemaining(userEmail);
  const isTrialExpired = hasTrialExpired(userEmail);
  
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSelectPlan = (planType: PlanType) => {
    setSelectedPlan(planType);
  };
  
  const handleCheckout = () => {
    if (!selectedPlan) {
      toast.error("Selecione um plano para continuar");
      return;
    }
    
    // Redirect to Kiwify payment page
    window.location.href = PAYMENT_LINKS[selectedPlan];
  };
  
  return (
    <MainLayout title="Escolha seu plano">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escolha seu plano</h1>
          <p className="text-muted-foreground mt-2">
            Selecione o plano que melhor se adapta às suas necessidades
          </p>
        </div>
        
        {userPlan.plan === PlanType.FREE_TRIAL && (
          <Alert variant={isTrialExpired ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {isTrialExpired 
                ? "Seu período de teste expirou" 
                : `Período de teste: ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia' : 'dias'} restantes`}
            </AlertTitle>
            <AlertDescription>
              {isTrialExpired
                ? "Escolha um plano abaixo para continuar usando o serviço."
                : "Aproveite o período de teste para explorar os recursos básicos do sistema."}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlanCard 
            planType={PlanType.BASIC}
            current={userPlan.plan === PlanType.BASIC}
            selected={selectedPlan === PlanType.BASIC}
            onSelect={() => handleSelectPlan(PlanType.BASIC)}
            showBuyButton={true}
          />
          
          <PlanCard 
            planType={PlanType.STANDARD}
            current={userPlan.plan === PlanType.STANDARD}
            selected={selectedPlan === PlanType.STANDARD}
            onSelect={() => handleSelectPlan(PlanType.STANDARD)}
            recommended
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
        
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Complete sua compra</CardTitle>
            <CardDescription>
              Você será redirecionado para uma página de pagamento seguro após confirmar sua escolha.
            </CardDescription>
          </CardHeader>
          
          <div className="space-y-4">
            {selectedPlan !== null ? (
              <div className="p-4 rounded-lg border bg-muted/40">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Plano {PLAN_DETAILS[selectedPlan].name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {PLAN_DETAILS[selectedPlan].agentLimit} {PLAN_DETAILS[selectedPlan].agentLimit === 1 ? 'agente' : 'agentes'} incluídos
                    </p>
                  </div>
                  <p className="font-bold">
                    R$ {PLAN_DETAILS[selectedPlan].price.toFixed(2).replace('.', ',')}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Selecione um plano acima para continuar
              </p>
            )}
            
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={handleCheckout} 
                disabled={selectedPlan === null}
                size="lg"
                className="w-full flex items-center justify-center"
              >
                Finalizar Compra <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/agents')}
                className="w-full"
              >
                Voltar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PlanCheckout;
