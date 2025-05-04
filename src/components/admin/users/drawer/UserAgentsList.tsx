
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Bot, AlertCircle } from "lucide-react";

interface UserAgentsListProps {
  userId: string;
}

interface Agent {
  id: string;
  name: string;
  instance_id: string;
  created_at: string;
  is_connected: boolean;
}

export function UserAgentsList({ userId }: UserAgentsListProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAgents = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', userId);
          
        if (error) throw error;
        
        setAgents(data || []);
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError("Erro ao carregar agentes");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgents();
  }, [userId]);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <p>{error}</p>
      </div>
    );
  }
  
  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Este usuário não possui agentes</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-3">
      {agents.map(agent => (
        <div key={agent.id} className="border rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{agent.name}</p>
              <p className="text-sm text-muted-foreground">{agent.instance_id}</p>
            </div>
            <Badge variant={agent.is_connected ? "success" : "outline"}>
              {agent.is_connected ? "Conectado" : "Desconectado"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
