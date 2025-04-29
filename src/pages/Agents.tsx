
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { AgentPanel, Agent } from "@/components/agent/AgentPanel";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Agents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulando uma chamada API para obter os agentes
    setTimeout(() => {
      const dummyAgents: Agent[] = [
        {
          id: "1",
          name: "Agente de Vendas",
          type: "sales",
          isConnected: false, // Inicialmente todos desconectados
          createdAt: new Date(2023, 2, 15)
        },
        {
          id: "2",
          name: "SDR Prospecção",
          type: "sdr",
          isConnected: false, // Inicialmente todos desconectados
          createdAt: new Date(2023, 4, 22)
        },
        {
          id: "3",
          name: "Atendimento ao Cliente",
          type: "support",
          isConnected: false, // Inicialmente todos desconectados
          createdAt: new Date(2023, 5, 10)
        }
      ];
      
      // Se houver um agente na sessão, adicione-o à lista
      const newAgentData = sessionStorage.getItem('newAgent');
      if (newAgentData) {
        const newAgent = JSON.parse(newAgentData);
        dummyAgents.unshift({
          id: `${dummyAgents.length + 1}`,
          name: newAgent.agentName,
          type: newAgent.agentType,
          isConnected: false, // Sempre inicia desconectado
          createdAt: new Date()
        });
        sessionStorage.removeItem('newAgent'); // Limpar após adicionar
      }
      
      setAgents(dummyAgents);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateAgent = () => {
    navigate('/create-agent');
  };

  return (
    <MainLayout title="Meus Agentes">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Meus Agentes</h2>
            <p className="text-muted-foreground">
              Gerencie e monitore seus agentes de IA.
            </p>
          </div>
          <Button className="md:w-auto w-full" onClick={handleCreateAgent}>
            <Plus className="mr-2 h-4 w-4" /> Criar Novo Agente
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <AgentPanel key={agent.id} agent={agent} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg p-8">
                <p>Nenhum agente encontrado. Crie seu primeiro agente!</p>
                <Button className="mt-4" onClick={handleCreateAgent}>
                  <Plus className="mr-2 h-4 w-4" /> Criar Agente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Agents;
