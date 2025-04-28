
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { AgentStatsOverview } from "@/components/agent/analytics/AgentStatsOverview";
import { AgentConversationChart } from "@/components/agent/analytics/AgentConversationChart";
import { AgentSatisfactionChart } from "@/components/agent/analytics/AgentSatisfactionChart";
import { AgentRecentConversations } from "@/components/agent/analytics/AgentRecentConversations";
import { useParams } from "react-router-dom";

interface AgentAnalyticsData {
  agentId: string;
  agentName: string;
  type: string;
  status: "online" | "offline";
  conversations: number;
  conversionRate: number;
  satisfactionScore: number;
  weeklyStats: {
    date: string;
    conversations: number;
    conversions: number;
  }[];
  satisfactionTrend: {
    date: string;
    score: number;
  }[];
  recentConversations: {
    id: string;
    customer: string;
    time: string;
    duration: string;
    status: "completed" | "abandoned" | "converted";
  }[];
}

const AgentAnalytics = () => {
  const { agentId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [agentData, setAgentData] = useState<AgentAnalyticsData | null>(null);

  useEffect(() => {
    // Simulate API call to fetch agent analytics data
    const fetchAgentData = () => {
      setIsLoading(true);
      setTimeout(() => {
        // Mock data for demonstration
        const mockAgentData: AgentAnalyticsData = {
          agentId: agentId || "1",
          agentName: "Agente de Vendas",
          type: "sales",
          status: "online",
          conversations: 124,
          conversionRate: 23.5,
          satisfactionScore: 4.7,
          weeklyStats: [
            { date: "2023-04-01", conversations: 12, conversions: 3 },
            { date: "2023-04-08", conversations: 18, conversions: 5 },
            { date: "2023-04-15", conversations: 15, conversions: 4 },
            { date: "2023-04-22", conversations: 22, conversions: 7 },
            { date: "2023-04-29", conversations: 30, conversions: 8 },
            { date: "2023-05-06", conversations: 27, conversions: 6 }
          ],
          satisfactionTrend: [
            { date: "2023-04-01", score: 4.2 },
            { date: "2023-04-08", score: 4.5 },
            { date: "2023-04-15", score: 4.3 },
            { date: "2023-04-22", score: 4.6 },
            { date: "2023-04-29", score: 4.7 },
            { date: "2023-05-06", score: 4.8 }
          ],
          recentConversations: [
            { id: "c1", customer: "João Silva", time: "10:30", duration: "4m 32s", status: "converted" },
            { id: "c2", customer: "Maria Oliveira", time: "11:15", duration: "2m 45s", status: "completed" },
            { id: "c3", customer: "Carlos Santos", time: "12:03", duration: "5m 12s", status: "converted" },
            { id: "c4", customer: "Ana Pereira", time: "13:27", duration: "1m 50s", status: "abandoned" },
            { id: "c5", customer: "Fernando Lima", time: "14:45", duration: "7m 23s", status: "completed" }
          ]
        };
        
        setAgentData(mockAgentData);
        setIsLoading(false);
      }, 1000);
    };

    fetchAgentData();
  }, [agentId]);

  if (isLoading) {
    return (
      <MainLayout title="Carregando...">
        <div className="space-y-6">
          <div className="h-24 bg-muted animate-pulse rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-80 bg-muted animate-pulse rounded-lg"></div>
          </div>
          <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  if (!agentData) {
    return (
      <MainLayout title="Agente não encontrado">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Agente não encontrado</h2>
          <p className="text-muted-foreground mt-2">
            O agente solicitado não existe ou foi removido.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Análise: ${agentData.agentName}`}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{agentData.agentName}</h1>
              <Badge variant={agentData.status === "online" ? "default" : "outline"}>
                {agentData.status === "online" ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Visão geral de desempenho e estatísticas de conversas
            </p>
          </div>
        </div>

        <AgentStatsOverview 
          conversations={agentData.conversations}
          conversionRate={agentData.conversionRate}
          satisfactionScore={agentData.satisfactionScore}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AgentConversationChart data={agentData.weeklyStats} />
          <AgentSatisfactionChart data={agentData.satisfactionTrend} />
        </div>

        <AgentRecentConversations conversations={agentData.recentConversations} />
      </div>
    </MainLayout>
  );
};

export default AgentAnalytics;
