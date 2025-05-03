import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface TrialBannerProps {
  userEmail?: string;
  isTrialExpired?: boolean;
  trialDaysRemaining?: number;
  onUpgrade?: () => void;
}

export const TrialBanner = ({ 
  userEmail, 
  isTrialExpired: propIsExpired, 
  trialDaysRemaining: propDaysRemaining, 
  onUpgrade 
}: TrialBannerProps) => {
  // If direct props are provided, use them, otherwise calculate from userEmail
  const isExpired = propIsExpired !== undefined ? propIsExpired : 
    userEmail ? hasTrialExpired(userEmail) : false;
  
  const daysRemaining = propDaysRemaining !== undefined ? propDaysRemaining : 
    userEmail ? getTrialDaysRemaining(userEmail) : 0;
  
  // If there's no trial (daysRemaining is 0 and not expired), don't show banner
  if (!daysRemaining && !isExpired) {
    return null;
  }
  
  if (isExpired) {
    return (
      <div className="w-full bg-destructive/15 dark:bg-destructive/20 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm font-medium">
            Seu período de teste gratuito expirou. Faça upgrade agora para continuar utilizando todos os recursos.
          </p>
        </div>
        {onUpgrade ? (
          <Button onClick={onUpgrade} className="whitespace-nowrap">
            Fazer Upgrade
          </Button>
        ) : (
          <Button asChild className="whitespace-nowrap">
            <Link to="/plans">Fazer Upgrade</Link>
          </Button>
        )}
      </div>
    );
  }
  
  if (!daysRemaining || daysRemaining <= 0) {
    return null;
  }
  
  return (
    <div className="w-full bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          {daysRemaining === 1
            ? "Seu período de teste gratuito expira hoje!"
            : `${daysRemaining} dias restantes no seu teste gratuito`}
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Faça upgrade do seu plano para continuar utilizando todos os recursos após o término do período de teste.
        </p>
      </div>
      {onUpgrade ? (
        <Button 
          onClick={onUpgrade} 
          variant="outline" 
          className="whitespace-nowrap border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900"
        >
          Ver Planos
        </Button>
      ) : (
        <Button 
          asChild 
          variant="outline" 
          className="whitespace-nowrap border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900"
        >
          <Link to="/plans">Ver Planos</Link>
        </Button>
      )}
    </div>
  );
};

// Need to import these functions since we're using them directly in the component
import { getTrialDaysRemaining, hasTrialExpired } from "@/services/plan/userPlanService";
