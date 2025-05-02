
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { AgentGrid } from "./AgentGrid";
import { Button } from "@/components/ui/button";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserAgents } from "@/services/agent/agentStorageService";
import { PlusCircle } from "lucide-react";
import { AgentType, AgentCard } from "./AgentCard";

interface AgentTypeTabsProps {
  currentTab: string;
  onCreateAgent: (type: AgentType) => void;
  onNavigateToAgents: () => void;
  isChecking?: boolean;
}

export function AgentTypeTabs({ 
  currentTab, 
  onCreateAgent, 
  onNavigateToAgents,
  isChecking = false
}: AgentTypeTabsProps) {
  const navigate = useNavigate();
  const userEmail = getCurrentUserEmail();
  const userAgents = getUserAgents(userEmail);
  
  const handleTabChange = (value: string) => {
    navigate(`/dashboard?tab=${value}`);
  };

  return (
    <Tabs defaultValue={currentTab} onValueChange={handleTabChange}>
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="discover">Tipos de Agentes</TabsTrigger>
          <TabsTrigger value="agents">Meus Agentes ({userAgents.length})</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="discover" className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Escolha um tipo de agente para começar</h3>
          <p className="text-muted-foreground mb-4">
            Selecione o tipo de agente que melhor se adequa às suas necessidades.
          </p>
        </div>
        <AgentGrid onCreateAgent={onCreateAgent} isChecking={isChecking} />
      </TabsContent>
      
      <TabsContent value="agents" className="space-y-4">
        {userAgents.length > 0 ? (
          <>
            <p className="text-muted-foreground">
              Gerencie seus agentes existentes ou crie novos para expandir seu atendimento.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAgents.map(agent => (
                <AgentCard
                  key={agent.id}
                  title={agent.name}
                  description={agent.type || "Agente personalizado"}
                  type={agent.type as AgentType || "custom"}
                  icon={agent.type ? agent.type.charAt(0).toUpperCase() + agent.type.slice(1) : "⚙️"}
                  onSelect={() => navigate(`/agent-analytics/${agent.id}`)}
                />
              ))}
            </div>
            
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => navigate('/dashboard?tab=discover')} 
                disabled={isChecking}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Novo Agente
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium mb-2">Você ainda não tem agentes</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro agente para começar a usar nossa plataforma.
            </p>
            <Button 
              onClick={() => navigate('/dashboard?tab=discover')} 
              disabled={isChecking}
            >
              Criar meu primeiro agente
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
