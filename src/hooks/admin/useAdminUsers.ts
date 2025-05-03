
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

      // Fetch users from auth.users via RPC (requires admin privileges)
      const { data: authUsers, error: authError } = await supabase.rpc("get_all_users");
      
      if (authError) {
        throw new Error(authError.message);
      }

      // Fetch user plans to enrich the data
      const { data: plans, error: plansError } = await supabase
        .from("user_plans")
        .select("*");
        
      if (plansError) {
        console.error("Error fetching user plans:", plansError);
      }

      // Map plans to users
      const enrichedUsers = authUsers.map((user: any) => {
        const userPlan = plans?.find(plan => plan.user_id === user.id);
        return {
          ...user,
          isActive: user.last_sign_in_at !== null,
          plan: userPlan ? {
            name: userPlan.name,
            agent_limit: userPlan.agent_limit,
            plan: userPlan.plan
          } : undefined
        };
      });

      setUsers(enrichedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch users"));
      toast.error("Erro ao carregar usuários");
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
