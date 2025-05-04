
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Bot, Clock, Edit2Icon, SaveIcon, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  createdAt: Date;
  instanceId: string;
  clientIdentifier?: string;
  connectInstancia: boolean;
  userId: string;
}

interface UserAgentsListProps {
  userId: string;
}

export function UserAgentsList({ userId }: UserAgentsListProps) {
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);
  const [newInstanceName, setNewInstanceName] = useState("");

  useEffect(() => {
    const fetchUserAgents = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        const agents = data.map(agent => ({
          id: agent.id,
          name: agent.name,
          type: agent.type,
          isConnected: agent.is_connected || false,
          createdAt: new Date(agent.created_at),
          instanceId: agent.instance_id,
          clientIdentifier: agent.client_identifier,
          connectInstancia: agent.connect_instancia || false,
          userId: agent.user_id
        }));
        
        setUserAgents(agents);
      } catch (error) {
        console.error('Erro ao carregar agentes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAgents();
  }, [userId]);

  const handleToggleConnection = async (agentId: string, isConnected: boolean) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ 
          is_connected: isConnected,
          connect_instancia: isConnected
        })
        .eq('id', agentId);
        
      if (error) throw error;
      
      setUserAgents(agents => agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, isConnected, connectInstancia: isConnected }
          : agent
      ));
      
      toast.success(
        isConnected ? "Agente conectado com sucesso" : "Agente desconectado com sucesso"
      );
    } catch (error) {
      console.error('Erro ao atualizar status do agente:', error);
      toast.error("Erro ao atualizar status do agente");
    }
  };

  const handleEditInstanceName = (agent: Agent) => {
    setEditingInstanceId(agent.id);
    setNewInstanceName(agent.instanceId);
  };

  const handleSaveInstanceName = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ instance_id: newInstanceName })
        .eq('id', agentId);
        
      if (error) throw error;
      
      setUserAgents(agents => agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, instanceId: newInstanceName }
          : agent
      ));
      
      setEditingInstanceId(null);
      toast.success("Nome da instância atualizado com sucesso");
    } catch (error) {
      console.error('Erro ao atualizar nome da instância:', error);
      toast.error("Erro ao atualizar nome da instância");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (userAgents.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <Bot className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">
          Este usuário não possui agentes
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4 -mr-4">
      <div className="space-y-2">
        {userAgents.map(agent => (
          <div 
            key={agent.id} 
            className={cn(
              "group relative bg-card rounded-lg border p-3 transition-all duration-200",
              "hover:shadow-sm hover:border-primary/20"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm truncate">{agent.name}</p>
                  <Badge 
                    variant={agent.isConnected ? "success" : "secondary"}
                    className="hidden group-hover:flex items-center gap-1 h-5 text-xs"
                  >
                    {agent.isConnected ? (
                      <><CheckCircle2 className="h-3 w-3" /> Conectado</>
                    ) : (
                      <><XCircle className="h-3 w-3" /> Desconectado</>
                    )}
                  </Badge>
                </div>

                {editingInstanceId === agent.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={newInstanceName}
                      onChange={(e) => setNewInstanceName(e.target.value)}
                      className="h-7 text-xs"
                      placeholder="Nome da instância"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => handleSaveInstanceName(agent.id)}
                    >
                      <SaveIcon className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => setEditingInstanceId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{agent.instanceId}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEditInstanceName(agent)}
                    >
                      <Edit2Icon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(agent.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <Switch
                  checked={agent.isConnected}
                  onCheckedChange={(checked) => handleToggleConnection(agent.id, checked)}
                  className="data-[state=checked]:bg-success h-5 w-9"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
