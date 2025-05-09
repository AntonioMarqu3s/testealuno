
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ADMIN_SESSION_KEY } from "@/context/AdminAuthContext";

export function useAdminAuthentication() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Attempting admin login with:", { email });
      
      // Normalize email (lowercase)
      const normalizedEmail = email.toLowerCase().trim();
      
      // Sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password
      });
      
      if (error) {
        console.error("Auth error:", error.message);
        toast.error("Falha na autenticação", {
          description: error.message
        });
        
        setIsAdmin(false);
        return false;
      }
      
      if (!data.user) {
        console.error("No user returned from auth");
        toast.error("Usuário não encontrado");
        setIsAdmin(false);
        return false;
      }
      
      console.log("User authenticated:", data.user.id);
      
      // Check metadata first
      if (data.user.user_metadata?.role === 'admin') {
        console.log("User confirmed as admin via metadata");
        localStorage.setItem(ADMIN_SESSION_KEY, "true");
        setIsAdmin(true);
        toast.success("Login administrativo bem-sucedido");
        navigate("/admin/dashboard");
        return true;
      }
      
      // Check admin status using is_admin_user edge function
      try {
        const { data: adminCheck, error: adminCheckError } = 
          await supabase.functions.invoke("is_admin_user", {
            body: { user_id: data.user.id }
          });
        
        if (adminCheckError) {
          console.error("Error verifying admin status:", adminCheckError);
          await supabase.auth.signOut();
          setIsAdmin(false);
          return false;
        }
        
        if (adminCheck?.isAdmin) {
          localStorage.setItem(ADMIN_SESSION_KEY, "true");
          setIsAdmin(true);
          toast.success("Login administrativo bem-sucedido");
          navigate("/admin/dashboard");
          return true;
        } else {
          console.error("User is not an admin");
          toast.error("Acesso negado", { 
            description: "Este usuário não tem permissão de administrador" 
          });
          await supabase.auth.signOut();
          setIsAdmin(false);
          return false;
        }
      } catch (err) {
        console.error("Error during admin verification:", err);
        await supabase.auth.signOut();
        setIsAdmin(false);
        return false;
      }
    } catch (err: any) {
      console.error("Error during admin login:", err);
      toast.error(`Erro ao fazer login: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(ADMIN_SESSION_KEY);
      setIsAdmin(false);
      toast.success("Logout administrativo bem-sucedido");
      navigate("/admin");
    } catch (err: any) {
      console.error("Error during admin logout:", err);
      toast.error(`Erro ao fazer logout: ${err.message}`);
    }
  };

  return {
    isAdmin,
    setIsAdmin,
    isLoading,
    setIsLoading,
    adminLogin,
    adminLogout,
  };
}
