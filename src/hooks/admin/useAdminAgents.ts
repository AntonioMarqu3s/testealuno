
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  userId: string;
  userEmail?: string;
  instanceId: string;
  createdAt: string;
}

export function useAdminAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all agents using admin privileges
      const { data, error: agentsError } = await supabase
        .from("agents")
        .select("*");
        
      if (agentsError) {
        throw new Error(agentsError.message);
      }

      // Get unique user IDs from agents
      const userIds = [...new Set(data.map(agent => agent.user_id))];
      
      // Fetch user emails in bulk
      const { data: userData, error: userError } = await supabase.rpc("get_emails_by_ids", {
        user_ids: userIds
      });
      
      if (userError) {
        console.error("Error fetching user emails:", userError);
      }

      // Map emails to agents
      const enrichedAgents = data.map(agent => {
        const userEmail = userData?.find(user => user.id === agent.user_id)?.email;
        
        return {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          isConnected: agent.is_connected || false,
          userId: agent.user_id,
          userEmail,
          instanceId: agent.instance_id,
          createdAt: agent.created_at || new Date().toISOString()
        };
      });

      setAgents(enrichedAgents);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch agents"));
      toast.error("Erro ao carregar agentes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    isLoading,
    error,
    fetchAgents
  };
}
