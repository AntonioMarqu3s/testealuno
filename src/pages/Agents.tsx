
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { AgentPanel, Agent } from "@/components/agent/AgentPanel";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserPlan, getCurrentUserEmail, generateInstanceId } from "@/services/userPlanService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const Agents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get actual user email
  const userEmail = getCurrentUserEmail();
  const [userPlan, setUserPlan] = useState(() => getUserPlan(userEmail));

  useEffect(() => {
    // Check if we should show the upgrade modal from URL parameter
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showUpgrade') === 'true') {
      setShowUpgradeModal(true);
    }

    // Simulando uma chamada API para obter os agentes
    setTimeout(() => {
      const dummyAgents: Agent[] = [
        {
          id: "1",
          name: "Agente de Vendas",
          type: "sales",
          isConnected: false,
          createdAt: new Date(2023, 2, 15),
          instanceId: generateInstanceId(userEmail, "Agente de Vendas")
        },
        {
          id: "2",
          name: "SDR Prospecção",
          type: "sdr",
          isConnected: false,
          createdAt: new Date(2023, 4, 22),
          instanceId: generateInstanceId(userEmail, "SDR Prospecção")
        },
        {
          id: "3",
          name: "Atendimento ao Cliente",
          type: "support",
          isConnected: false,
          createdAt: new Date(2023, 5, 10),
          instanceId: generateInstanceId(userEmail, "Atendimento ao Cliente")
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
          isConnected: false,
          createdAt: new Date(),
          instanceId: newAgent.instanceId
        });
        sessionStorage.removeItem('newAgent'); // Limpar após adicionar
      }
      
      // Limitar agentes conforme o plano do usuário
      const userPlan = getUserPlan(userEmail);
      let filteredAgents = dummyAgents;
      if (userPlan.plano === 1) {
        filteredAgents = dummyAgents.slice(0, 1);
      }
      
      setAgents(filteredAgents);
      setUserPlan(userPlan);
      setIsLoading(false);
    }, 1000);
  }, [location.search, userEmail]);

  const handleCreateAgent = () => {
    // Verificar se o usuário pode criar mais agentes
    const userPlan = getUserPlan(userEmail);
    if (userPlan.plano === 1 && userPlan.agentCount >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    
    navigate('/dashboard?tab=agents');
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents((currentAgents) => 
      currentAgents.filter((agent) => agent.id !== agentId)
    );
  };

  const handleUpgrade = () => {
    // Simula um checkout de plano premium
    // Em uma implementação real, isso redirecionaria para uma página de pagamento
    console.log("Redirecionando para checkout do plano premium");
    setShowUpgradeModal(false);
    
    // Mock checkout - simulação de página de pagamento
    navigate('/checkout');
  };

  // Função auxiliar para gerar ID de instância
  function generateInstanceId(email: string, agentName: string): string {
    return `${email}-${agentName}`.replace(/\s+/g, '-').toLowerCase();
  }

  return (
    <MainLayout title="Meus Agentes">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Meus Agentes</h2>
            <p className="text-muted-foreground">
              Gerencie e monitore seus agentes de IA.
            </p>
            <p className="text-xs mt-1 font-medium">
              Plano atual: <span className={userPlan.plano === 1 ? "text-muted-foreground" : "text-primary"}>
                {userPlan.plano === 1 ? "Básico (1 agente)" : "Premium (ilimitado)"}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            {userPlan.plano === 1 && (
              <Button 
                variant="outline" 
                className="md:w-auto w-full" 
                onClick={() => setShowUpgradeModal(true)}
              >
                <CreditCard className="mr-2 h-4 w-4" /> Fazer Upgrade
              </Button>
            )}
            <Button className="md:w-auto w-full" onClick={handleCreateAgent}>
              <Plus className="mr-2 h-4 w-4" /> Criar Novo Agente
            </Button>
          </div>
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
                  <AgentPanel 
                    key={agent.id} 
                    agent={agent} 
                    onDelete={handleDeleteAgent}
                  />
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

        {/* Modal de Upgrade */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Faça upgrade para o plano Premium</DialogTitle>
              <DialogDescription>
                O plano básico permite apenas 1 agente. Upgrade para o plano Premium para criar agentes ilimitados.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="rounded-lg border p-4 mb-4">
                <h4 className="font-medium mb-2">Plano Premium</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ Agentes ilimitados</li>
                  <li>✅ Funções avançadas de IA</li>
                  <li>✅ Suporte prioritário</li>
                  <li>✅ Integração com CRM</li>
                </ul>
                <p className="mt-4 font-bold text-lg">R$ 99,90/mês</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>Cancelar</Button>
              <Button onClick={handleUpgrade}>
                <CreditCard className="mr-2 h-4 w-4" /> Fazer upgrade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Agents;
