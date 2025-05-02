
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { AgentGrid } from "./AgentGrid";
import { Button } from "@/components/ui/button";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserAgents } from "@/services/agent/agentStorageService";
import { PlusCircle } from "lucide-react";

interface AgentTypeTabsProps {
  currentTab: string;
  onCreateAgent: () => void;
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
          <TabsTrigger value="agents">Meus Agentes ({userAgents.length})</TabsTrigger>
          <TabsTrigger value="discover">Conhecer Mais</TabsTrigger>
        </TabsList>
        
        <Button onClick={onCreateAgent} disabled={isChecking}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {isChecking ? "Verificando..." : "Criar Agente"}
        </Button>
      </div>
      
      <TabsContent value="agents" className="space-y-4">
        {userAgents.length > 0 ? (
          <>
            <p className="text-muted-foreground">
              Gerencie seus agentes existentes ou crie novos para expandir seu atendimento.
            </p>
            
            <Button variant="outline" onClick={onNavigateToAgents}>
              Ver todos os meus agentes
            </Button>
          </>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium mb-2">Você ainda não tem agentes</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro agente para começar a usar nossa plataforma.
            </p>
            <Button onClick={onCreateAgent} disabled={isChecking}>
              {isChecking ? "Verificando..." : "Criar meu primeiro agente"}
            </Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="discover">
        <p className="text-muted-foreground mb-4">
          Conheça nosso catálogo de agentes disponíveis e escolha o melhor para o seu negócio.
        </p>
        <AgentGrid onCreateAgent={onCreateAgent} isChecking={isChecking} />
      </TabsContent>
    </Tabs>
  );
}
