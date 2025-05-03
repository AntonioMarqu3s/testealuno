
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AgentDetailsProps {
  agentId: string;
}

interface AgentInfo {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  userId: string;
  userEmail?: string;
  instanceId: string;
  createdAt: string;
  data?: Record<string, any>;
}

export function AgentDetails({ agentId }: AgentDetailsProps) {
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgentDetails() {
      try {
        setLoading(true);
        
        // Fetch agent
        const { data: agentData, error: agentError } = await supabase
          .from("agents")
          .select("*")
          .eq("id", agentId)
          .single();
          
        if (agentError) throw agentError;
        
        // Fetch user email
        const { data: userData, error: userError } = await supabase.rpc("get_user_by_id", {
          p_user_id: agentData.user_id
        });
        
        if (userError && userError.code !== "PGRST116") {
          console.error("Error fetching user:", userError);
        }
        
        const agentInfo: AgentInfo = {
          id: agentData.id,
          name: agentData.name,
          type: agentData.type,
          isConnected: agentData.is_connected || false,
          userId: agentData.user_id,
          userEmail: userData?.email,
          instanceId: agentData.instance_id,
          createdAt: agentData.created_at || new Date().toISOString(),
          data: agentData.agent_data
        };
        
        setAgent(agentInfo);
      } catch (error) {
        console.error("Error fetching agent details:", error);
        toast.error("Erro ao carregar detalhes do agente");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAgentDetails();
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center p-8">
        <p>Agente não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-md">
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="font-medium text-lg">{agent.name}</h3>
            <p className="text-sm text-muted-foreground">ID: {agent.id}</p>
          </div>
          <Badge variant={agent.isConnected ? "success" : "outline"}>
            {agent.isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm text-muted-foreground">Tipo</p>
            <p>{agent.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Usuário</p>
            <p>{agent.userEmail || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ID da Instância</p>
            <p className="font-mono text-sm">{agent.instanceId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Criado em</p>
            <p>{new Date(agent.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados do Agente</CardTitle>
          <CardDescription>
            Informações detalhadas configuradas para este agente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!agent.data ? (
            <p className="text-center py-4 text-muted-foreground">
              Nenhuma informação adicional disponível
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(agent.data).map(([key, value]) => (
                <div key={key} className="border-b pb-2 last:border-b-0">
                  <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-sm text-muted-foreground">
                    {typeof value === 'object' 
                      ? JSON.stringify(value, null, 2) 
                      : String(value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline">Editar Agente</Button>
        <Button variant="destructive">Excluir Agente</Button>
      </div>
    </div>
  );
}
