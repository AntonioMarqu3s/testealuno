
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string | null;
  isActive: boolean;
  metadata?: Record<string, any>;
  plan?: {
    id: string;
    name: string;
    agent_limit: number;
    plan: number;
    payment_date?: string;
    subscription_ends_at?: string;
    payment_status?: string;
    trial_ends_at?: string;
    connect_instancia?: boolean;
  };
}

export interface UserFormData {
  email: string;
  password?: string;
  confirmPassword?: string;
}

export function useUserDetailDrawer(userId: string | null, onClose: () => void, onUserUpdated: () => void) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false);
  
  // Fetch user details
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Buscar dados do usuário usando RPC
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_details', { p_user_id: userId });
        
      if (userError) throw userError;
      if (!userData) throw new Error("Usuário não encontrado");

      // Buscar dados do plano do usuário
      const { data: planData, error: planError } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (planError && planError.code !== 'PGRST116') { // Ignora erro de não encontrado
        throw planError;
      }

      const formattedUserData: UserData = {
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at,
        last_sign_in_at: userData.last_sign_in_at,
        isActive: userData.is_active,
        metadata: userData.raw_user_meta_data,
        plan: planData ? {
          id: planData.id,
          name: planData.name,
          agent_limit: planData.agent_limit,
          plan: planData.plan,
          payment_date: planData.payment_date,
          subscription_ends_at: planData.subscription_ends_at,
          payment_status: planData.payment_status,
          trial_ends_at: planData.trial_ends_at,
          connect_instancia: planData.connect_instancia
        } : undefined
      };
      
      setUserData(formattedUserData);
    } catch (err) {
      console.error("Error fetching user details:", err);
      toast.error("Erro ao carregar detalhes do usuário");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePasswordToggle = () => {
    setShowPasswordFields(!showPasswordFields);
  };
  
  const handleUpdateUser = async (formData: UserFormData) => {
    if (!userId || !userData) return;
    
    // Validate password if it's being changed
    if (showPasswordFields && formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
    }
    
    setIsUpdating(true);
    try {
      // Update user data using RPC
      const { error: updateError } = await supabase
        .rpc('update_user_details', {
          p_user_id: userId,
          p_email: formData.email,
          p_password: showPasswordFields ? formData.password : null
        });

      if (updateError) throw updateError;
      
      // Update local state
      setUserData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          email: formData.email
        };
      });
      
      // Refresh user data to ensure we have the latest
      await fetchUserData();
      
      toast.success("Usuário atualizado com sucesso");
      setShowPasswordFields(false);
      onUserUpdated(); 
      onClose();
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Erro ao atualizar usuário");
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    userData,
    setUserData,
    isLoading,
    isUpdating,
    showPasswordFields,
    handlePasswordToggle,
    handleUpdateUser,
    fetchUserData
  };
}
