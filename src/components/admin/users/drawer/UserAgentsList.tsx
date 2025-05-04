
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Bot, Ban, CheckCircle, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Agent {
  id: string;
  name: string;
  type: string;
  is_connected: boolean;
  created_at: string;
  instance_id: string;
  client_identifier?: string;
  connect_instancia?: boolean;
}

interface UserAgentsListProps {
  userId: string;
}

export function UserAgentsList({ userId }: UserAgentsListProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!userId) {
        setAgents([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("user_id", userId);

        if (error) throw error;
        
        setAgents(data || []);
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast.error("Falha ao carregar lista de agentes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [userId]);

  const toggleAgentConnection = async (agentId: string, isConnected: boolean) => {
    try {
      const { error } = await supabase
        .from("agents")
        .update({ is_connected: isConnected })
        .eq("id", agentId);

      if (error) throw error;

      setAgents(agents.map(agent => 
        agent.id === agentId ? { ...agent, is_connected: isConnected } : agent
      ));

      toast.success(
        isConnected ? "Agente conectado com sucesso" : "Agente desconectado"
      );
    } catch (error) {
      console.error("Error toggling agent connection:", error);
      toast.error("Falha ao atualizar status do agente");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium text-lg mb-1">Sem Agentes</h3>
          <p className="text-muted-foreground text-sm">
            Este usuário não possui nenhum agente configurado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Agentes do Usuário ({agents.length})
        </h3>
        
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {agents.map((agent) => (
              <div 
                key={agent.id}
                className="border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{agent.name}</span>
                      <Badge 
                        variant={agent.is_connected ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {agent.is_connected ? 
                          <CheckCircle className="h-3 w-3 mr-1" /> : 
                          <XCircle className="h-3 w-3 mr-1" />
                        }
                        {agent.is_connected ? "Conectado" : "Desconectado"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span>ID: {agent.id}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Criado em: {format(new Date(agent.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={agent.is_connected} 
                      onCheckedChange={(checked) => toggleAgentConnection(agent.id, checked)}
                      className="data-[state=checked]:bg-success"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
