import React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

interface UserAgentsListProps {
  userId: string;
}

export function UserAgentsList({ userId }: UserAgentsListProps) {
  const [agents, setAgents] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      if (!userId) return;
      
      try {
        console.log("Buscando agentes para userId:", userId);
        
        // Buscar agentes diretamente usando o user_id do admin_users
        const { data, error } = await supabase
          .from('agents')
          .select(`
            id,
            name,
            type,
            is_connected,
            instance_id,
            created_at
          `)
          .eq('user_id', userId);
          
        console.log("Resposta da busca de agentes:", { data, error });
        
        if (error) throw error;
        setAgents(data || []);
      } catch (err) {
        console.error('Erro ao carregar agentes:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [userId]);

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="mb-2">🤖</div>
        Este usuário não possui agentes
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <div key={agent.id} className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-lg">{agent.name || 'Sem nome'}</span>
              <Badge variant={agent.is_connected ? "success" : "destructive"}>
                {agent.is_connected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Tipo: </span>
              <Badge variant="outline">{agent.type || 'Não definido'}</Badge>
            </div>
            <div>
              <span className="font-medium text-foreground">ID da Instância: </span>
              {agent.instance_id || 'N/A'}
            </div>
            <div>
              <span className="font-medium text-foreground">Criado em: </span>
              {new Date(agent.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 