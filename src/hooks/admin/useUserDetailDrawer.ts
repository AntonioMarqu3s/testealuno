
import { useState, useEffect } from "react";
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
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // Use the edge function to get user details
        const { data, error } = await supabase.functions.invoke("get-user-details", {
          body: { userId }
        });
          
        if (error) throw error;
        
        console.log("Fetched user data:", data);
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        toast.error("Erro ao carregar detalhes do usuário");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  const handlePasswordToggle = () => {
    setShowPasswordFields(!showPasswordFields);
  };
  
  const handleUpdateUser = async (formData: UserFormData) => {
    if (!userId) return;
    
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
      // Update the user's email if changed
      if (userData && formData.email !== userData.email) {
        const { data: updateResult, error: updateEmailError } = await supabase.functions.invoke("update-user-credentials", {
          body: { 
            userId,
            email: formData.email,
          }
        });
        
        if (updateEmailError) throw updateEmailError;
        
        if (!updateResult.success) {
          throw new Error(updateResult.message || "Erro ao atualizar email");
        }
      }
      
      // Update password if changed
      if (showPasswordFields && formData.password) {
        const { data: updateResult, error: updatePasswordError } = await supabase.functions.invoke("update-user-credentials", {
          body: { 
            userId,
            password: formData.password,
          }
        });
        
        if (updatePasswordError) throw updatePasswordError;
        
        if (!updateResult.success) {
          throw new Error(updateResult.message || "Erro ao atualizar senha");
        }
      }
      
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
    isLoading,
    isUpdating,
    showPasswordFields,
    handlePasswordToggle,
    handleUpdateUser
  };
}
