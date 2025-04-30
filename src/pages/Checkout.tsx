
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { upgradeToPremium, saveCheckoutInfo, getCurrentUserEmail } from "@/services/userPlanService";

const Checkout = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  // Get actual user email
  const userEmail = getCurrentUserEmail();
  
  const handleProcessPayment = () => {
    setIsProcessing(true);
    
    // Simulando processamento de pagamento
    setTimeout(() => {
      // Atualizar plano do usuário para premium
      upgradeToPremium(userEmail);
      
      // Gerar e salvar código de checkout (para admin)
      const checkoutCode = `CHK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      saveCheckoutInfo(userEmail, checkoutCode);
      
      toast.success("Pagamento processado com sucesso!", {
        description: "Seu plano foi atualizado para Premium."
      });
      
      // Redirecionar para a página de agentes
      navigate('/agents');
      setIsProcessing(false);
    }, 2000);
  };
  
  return (
    <MainLayout title="Checkout">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finalizar Compra</h1>
          <p className="text-muted-foreground mt-2">
            Complete seu pagamento para fazer upgrade para o plano Premium
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Plano Premium</CardTitle>
            <CardDescription>Agentes ilimitados e recursos avançados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Número do Cartão</Label>
              <Input id="cardNumber" placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Data de Validade</Label>
                <Input id="expiry" placeholder="MM/AA" />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
            <div>
              <Label htmlFor="name">Nome no Cartão</Label>
              <Input id="name" placeholder="Nome completo" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleProcessPayment} 
              disabled={isProcessing}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessing ? "Processando..." : "Pagar R$ 99,90"}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="text-center text-xs text-muted-foreground">
          Pagamento seguro. Você pode cancelar seu plano a qualquer momento.
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
