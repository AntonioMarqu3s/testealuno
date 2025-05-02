
import { useNavigate } from "react-router-dom";
import { AgentGrid } from "@/components/dashboard/AgentGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { memo } from "react";

interface AgentTypeTabsProps {
  currentTab: string;
  onCreateAgent: () => void;
  onNavigateToAgents: () => void;
}

export const AgentTypeTabs = memo(({ 
  currentTab, 
  onCreateAgent, 
  onNavigateToAgents 
}: AgentTypeTabsProps) => {
  return (
    <Tabs defaultValue={currentTab} value={currentTab}>
      <TabsList>
        <TabsTrigger value="agents">Tipos de Agentes</TabsTrigger>
        <TabsTrigger value="my-agents" onClick={onNavigateToAgents}>Meus Agentes</TabsTrigger>
      </TabsList>
      <TabsContent value="agents" className="space-y-6">
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Escolha um tipo de agente para começar</h3>
          <AgentGrid />
        </div>
      </TabsContent>
      <TabsContent value="my-agents">
        <div className="mt-6 flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium">Nenhum agente criado ainda</h3>
          <p className="text-muted-foreground text-center max-w-md mt-2 mb-6">
            Crie seu primeiro agente de IA personalizado para automatizar tarefas de vendas, prospecção ou atendimento.
          </p>
          <Button onClick={onCreateAgent}>
            <Plus className="mr-2 h-4 w-4" /> Criar Agente
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
});

AgentTypeTabs.displayName = "AgentTypeTabs";
