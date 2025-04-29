
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyAgentStateProps {
  onCreateAgent: () => void;
}

export const EmptyAgentState = ({ onCreateAgent }: EmptyAgentStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg p-8">
      <p>Nenhum agente encontrado. Crie seu primeiro agente!</p>
      <Button className="mt-4" onClick={onCreateAgent}>
        <Plus className="mr-2 h-4 w-4" /> Criar Agente
      </Button>
    </div>
  );
};
