
import { Button } from "@/components/ui/button";

interface WelcomeHeaderProps {
  onCreateAgent: () => void;
}

export const WelcomeHeader = ({ onCreateAgent }: WelcomeHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bem-vindo ao Agent Hub</h2>
        <p className="text-muted-foreground">
          Crie e personalize seus agentes de IA para diferentes finalidades.
        </p>
      </div>
      <Button className="md:w-auto w-full" onClick={onCreateAgent}>
        Criar Novo Agente
      </Button>
    </div>
  );
}
