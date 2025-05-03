
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  created_at: string;
  isActive: boolean;
  plan?: {
    name: string;
    agent_limit: number;
    plan: number;
  };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching users from edge function");
      // Fetch users using our edge function
      const { data, error } = await supabase.functions.invoke("get_all_users");
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Error fetching users");
      }

      if (!data || !Array.isArray(data)) {
        console.error("Invalid response from edge function:", data);
        throw new Error("Invalid response from server");
      }
      
      console.log(`Successfully fetched ${data.length} users`);

      // Fetch user plans to enrich the data
      const { data: plans, error: plansError } = await supabase
        .from("user_plans")
        .select("*");
        
      if (plansError) {
        console.error("Error fetching user plans:", plansError);
        // Continue without plans data
      }

      // Map plans to users
      const enrichedUsers = data.map((user: any) => {
        const userPlan = plans?.find(plan => plan.user_id === user.id);
        return {
          ...user,
          plan: userPlan ? {
            name: userPlan.name || "Plano Básico",
            agent_limit: userPlan.agent_limit,
            plan: userPlan.plan
          } : undefined
        };
      });

      setUsers(enrichedUsers);
    } catch (err) {
      console.error("Error in fetchUsers:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch users"));
      toast.error("Erro ao carregar usuários", {
        description: err instanceof Error ? err.message : "Erro desconhecido"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (email: string, password: string, planType: number): Promise<boolean> => {
    try {
      // Call an admin function to create a user
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: { email, password, planType }
      });
      
      if (error) {
        toast.error("Erro ao criar usuário", {
          description: error.message
        });
        return false;
      }
      
      toast.success("Usuário criado com sucesso");
      fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error("Erro ao criar usuário");
      return false;
    }
  };

  const updateUserPlan = async (userId: string, planType: number, agentLimit: number): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke("admin-update-plan", {
        body: { userId, planType, agentLimit }
      });
      
      if (error) {
        toast.error("Erro ao atualizar plano", {
          description: error.message
        });
        return false;
      }
      
      toast.success("Plano atualizado com sucesso");
      fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      console.error("Error updating user plan:", err);
      toast.error("Erro ao atualizar plano");
      return false;
    }
  };

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUserPlan
  };
}
