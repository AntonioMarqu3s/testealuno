
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TrialBannerProps {
  isTrialExpired: boolean;
  trialDaysRemaining: number;
  onUpgrade: () => void;
}

export const TrialBanner = ({ 
  isTrialExpired, 
  trialDaysRemaining, 
  onUpgrade 
}: TrialBannerProps) => {
  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-medium text-lg">
              {isTrialExpired ? (
                "Seu período de teste expirou!"
              ) : (
                `Seu período de teste termina em ${trialDaysRemaining} ${trialDaysRemaining === 1 ? 'dia' : 'dias'}`
              )}
            </h3>
            <p className="text-muted-foreground">
              {isTrialExpired 
                ? "Faça upgrade agora para continuar usando todos os recursos."
                : "Aproveite todos os recursos e benefícios durante seu período de teste gratuito."}
            </p>
          </div>
          <Button onClick={onUpgrade} variant={isTrialExpired ? "default" : "outline"}>
            Fazer upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
