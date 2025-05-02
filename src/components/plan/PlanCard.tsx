
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, XIcon, ClockIcon, ExternalLinkIcon } from "lucide-react";
import { PLAN_DETAILS, PlanType, getPlanPrice } from "@/services/plan/userPlanService";
import { Button } from "../ui/button";

interface PlanCardProps {
  planType: PlanType;
  current: boolean;
  selected: boolean;
  onSelect: () => void;
  recommended?: boolean;
  showTrialDays?: boolean;
  showBuyButton?: boolean;
}

const PLAN_FEATURES = {
  [PlanType.BASIC]: [
    { name: '1 agente', included: true },
    { name: 'Suporte por email', included: true },
    { name: 'Personalização básica', included: true },
    { name: 'Integrações avançadas', included: false },
    { name: 'Analytics avançado', included: false },
  ],
  [PlanType.STANDARD]: [
    { name: '3 agentes', included: true },
    { name: 'Suporte por email', included: true },
    { name: 'Personalização avançada', included: true },
    { name: 'Integrações com CRM', included: true },
    { name: 'Analytics avançado', included: false },
  ],
  [PlanType.PREMIUM]: [
    { name: '10 agentes', included: true },
    { name: 'Suporte prioritário', included: true },
    { name: 'Personalização completa', included: true },
    { name: 'Todas as integrações', included: true },
    { name: 'Analytics em tempo real', included: true },
  ]
};

// Payment links for each plan
export const PAYMENT_LINKS = {
  [PlanType.BASIC]: "https://pay.kiwify.com.br/LK39fRl",
  [PlanType.STANDARD]: "https://pay.kiwify.com.br/GUuGlZ4",
  [PlanType.PREMIUM]: "https://pay.kiwify.com.br/DkDchr3",
};

export function PlanCard({ 
  planType, 
  current, 
  selected, 
  onSelect, 
  recommended,
  showTrialDays = false,
  showBuyButton = false
}: PlanCardProps) {
  const planDetails = PLAN_DETAILS[planType];
  const features = PLAN_FEATURES[planType];
  const paymentLink = PAYMENT_LINKS[planType];
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelect
    window.open(paymentLink, '_blank');
  };
  
  return (
    <Card 
      className={`relative ${selected ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''} 
                 ${current ? 'bg-primary/5' : ''} 
                 hover:border-primary/70 transition-all cursor-pointer`}
      onClick={onSelect}
    >
      {current && (
        <Badge variant="outline" className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
          Seu plano
        </Badge>
      )}
      
      {recommended && (
        <Badge variant="outline" className="absolute -top-2 -left-2 bg-orange-500 text-white border-orange-500">
          Recomendado
        </Badge>
      )}

      <CardHeader>
        <CardTitle>{planDetails.name}</CardTitle>
        <CardDescription>
          {planType === PlanType.BASIC && "Para usuários iniciantes"}
          {planType === PlanType.STANDARD && "Ideal para pequenos negócios"}
          {planType === PlanType.PREMIUM && "Para uso profissional"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">
          {getPlanPrice(planType)}
          <span className="text-sm font-normal text-muted-foreground">/mês</span>
        </div>
        
        {/* Show trial days badge only for BASIC plan if showTrialDays is true */}
        {planType === PlanType.BASIC && showTrialDays && (
          <div className="mb-3">
            <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
              <ClockIcon className="h-3 w-3" />
              <span>5 dias de teste com código promocional</span>
            </Badge>
          </div>
        )}
        
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              {feature.included ? (
                <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <XIcon className="mr-2 h-4 w-4 text-gray-300" />
              )}
              <span className={feature.included ? '' : 'text-muted-foreground'}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>

        {showBuyButton && (
          <Button 
            className="w-full mt-4 flex items-center justify-center" 
            onClick={handleBuyNow}
          >
            Assinar <ExternalLinkIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
      <CardFooter>
        <div className={`w-full h-2 rounded-full ${selected ? 'bg-primary' : 'bg-muted'}`}></div>
      </CardFooter>
    </Card>
  );
}
