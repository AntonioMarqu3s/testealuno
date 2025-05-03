
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
    payment_date?: string;
    subscription_ends_at?: string;
    payment_status?: string;
    trial_ends_at?: string;
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

      console.log("Fetching users with admin access");
      
      // Use the get_all_users edge function
      const { data: usersData, error: fetchError } = await supabase.functions.invoke("get_all_users", {
        method: 'GET'
      });
      
      if (fetchError) {
        console.error("Error fetching users:", fetchError);
        throw new Error(`Error fetching users: ${fetchError.message}`);
      }
      
      if (!usersData) {
        throw new Error("No user data returned");
      }
      
      if (typeof usersData === 'string') {
        try {
          // Handle case where error message is returned as string
          const errorData = JSON.parse(usersData);
          if (errorData.error) {
            throw new Error(errorData.error);
          }
        } catch (err) {
          // If it's not valid JSON, just continue
          console.warn("Unexpected response format, continuing:", usersData);
        }
      }
      
      console.log(`Successfully fetched ${Array.isArray(usersData) ? usersData.length : 0} users`);

      // Format user data
      let formattedUsers = (Array.isArray(usersData) ? usersData : []).map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        isActive: user.last_sign_in_at !== null,
        metadata: user.metadata
      }));

      // Fetch user plans to enrich the data
      const { data: plans, error: plansError } = await supabase
        .from("user_plans")
        .select("*");
        
      if (plansError) {
        console.error("Error fetching user plans:", plansError);
        // Continue without plans data
      } else if (plans) {
        console.log(`Successfully fetched ${plans.length} user plans`);
      }

      // Map plans to users
      formattedUsers = formattedUsers.map(user => {
        const userPlan = plans?.find(plan => plan.user_id === user.id);
        return {
          ...user,
          plan: userPlan ? {
            name: userPlan.name || "Plano Básico",
            agent_limit: userPlan.agent_limit,
            plan: userPlan.plan,
            payment_date: userPlan.payment_date,
            subscription_ends_at: userPlan.subscription_ends_at,
            payment_status: userPlan.payment_status,
            trial_ends_at: userPlan.trial_ends_at
          } : undefined
        };
      });

      setUsers(formattedUsers);
    } catch (err) {
      console.error("Error in fetchUsers:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch users";
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error("Erro ao carregar usuários", {
        description: errorMessage
      });
      
      // Add fallback mock data for development/demo only if in development
      if (import.meta.env.DEV) {
        const mockUsers = [
          {
            id: "d6ef66ca-d0f0-4884-89e2-9173b91fd987",
            email: "admin@example.com",
            created_at: "2025-04-01T10:00:00Z",
            isActive: true,
            metadata: { name: "Admin User" }
          }
        ];
        
        setUsers(mockUsers);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (email: string, password: string, planType: number): Promise<boolean> => {
    try {
      console.log("Creating new user with plan type:", planType);
      
      // Try to create the user directly
      const { error } = await supabase.functions.invoke("admin-create-user", {
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
      console.log("Updating user plan:", { userId, planType, agentLimit });
      
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
