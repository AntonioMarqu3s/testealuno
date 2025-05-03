
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type AdminAuthContextType = {
  isAdmin: boolean;
  isLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isLoading: true,
  adminLogin: async () => false,
  adminLogout: async () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export const ADMIN_SESSION_KEY = "admin_authenticated";

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check for admin session on load
  useEffect(() => {
    const checkAdminSession = async () => {
      const adminSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (adminSession === "true") {
        // Verify with Supabase if session is valid
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Verify admin role (this will be checked via RLS later)
          const { data } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (data) {
            setIsAdmin(true);
          } else {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            setIsAdmin(false);
          }
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
          setIsAdmin(false);
        }
      }
      
      setIsLoading(false);
    };

    checkAdminSession();
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error("Falha na autenticação", {
          description: error.message
        });
        setIsAdmin(false);
        return false;
      }
      
      if (!data.user) {
        toast.error("Usuário não encontrado");
        setIsAdmin(false);
        return false;
      }
      
      // Check if the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (adminError || !adminData) {
        toast.error("Usuário não tem permissões administrativas");
        await supabase.auth.signOut();
        setIsAdmin(false);
        return false;
      }
      
      // Set the admin session
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      setIsAdmin(true);
      toast.success("Login administrativo bem-sucedido");
      navigate("/admin/dashboard");
      return true;
    } catch (err) {
      console.error("Error during admin login:", err);
      toast.error("Erro ao fazer login");
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
    } catch (err) {
      console.error("Error during admin logout:", err);
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
