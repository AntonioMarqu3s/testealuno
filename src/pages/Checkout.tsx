
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Check } from "lucide-react";
import { PlanType } from "@/services/plan/userPlanService";
import { toast } from "sonner";
import { getCurrentUserEmail } from "@/services/user/userService";
import { upgradeToPlan } from "@/services/checkout/checkoutService";

const Checkout = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCheckout = async (planType: PlanType) => {
    setIsProcessing(true);
    
    try {
      const email = getCurrentUserEmail();
      
      // Upgrade the user's plan
      const result = await upgradeToPlan(email, planType);
      
      if (result) {
        toast.success("Plano atualizado com sucesso!", {
          description: "Seu plano foi atualizado. Agora você pode criar mais agentes.",
        });
        
        // Redirect to agents page
        navigate("/agents");
      } else {
        throw new Error("Falha ao atualizar plano");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar pagamento", {
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout title="Finalizar Compra">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Selecionar Plano</h2>
          <p className="text-muted-foreground mt-2">
            Escolha o plano mais adequado para suas necessidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Plano Básico</CardTitle>
              <CardDescription>Para começar com IA</CardDescription>
              <div className="mt-4 text-3xl font-bold">R$ 97<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>1 Agente IA</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Integrações básicas</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Suporte por email</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleCheckout(PlanType.BASIC)}
                disabled={isProcessing}
              >
                Selecionar {isProcessing && "..."}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-full w-fit mb-2">Popular</div>
              <CardTitle>Plano Padrão</CardTitle>
              <CardDescription>Ideal para pequenos times</CardDescription>
              <div className="mt-4 text-3xl font-bold">R$ 210<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>3 Agentes IA</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Todas as integrações</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Analytics básico</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleCheckout(PlanType.STANDARD)}
                disabled={isProcessing}
              >
                Selecionar {isProcessing && "..."}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plano Premium</CardTitle>
              <CardDescription>Para empresas em crescimento</CardDescription>
              <div className="mt-4 text-3xl font-bold">R$ 600<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>10 Agentes IA</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Integrações avançadas</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Suporte 24/7</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>Analytics completo</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleCheckout(PlanType.PREMIUM)}
                disabled={isProcessing}
              >
                Selecionar {isProcessing && "..."}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => navigate("/dashboard")}
          >
            Ir para Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
