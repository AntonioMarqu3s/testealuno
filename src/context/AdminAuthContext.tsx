
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
      try {
        const adminSession = localStorage.getItem(ADMIN_SESSION_KEY);
        console.log("Checking admin session:", adminSession);
        
        if (adminSession === "true") {
          // Verify with Supabase if session is valid
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error("Error getting user:", userError);
            localStorage.removeItem(ADMIN_SESSION_KEY);
            setIsAdmin(false);
            setIsLoading(false);
            return;
          }
          
          if (user) {
            console.log("Found user:", user.id);
            // Verify admin role
            const { data, error: adminError } = await supabase
              .from('admin_users')
              .select('*')
              .eq('user_id', user.id)
              .single();
            
            if (adminError) {
              console.error("Error checking admin status:", adminError);
              localStorage.removeItem(ADMIN_SESSION_KEY);
              setIsAdmin(false);
              setIsLoading(false);
              return;
            }
              
            if (data) {
              console.log("User is admin:", data);
              setIsAdmin(true);
            } else {
              console.log("User is not admin");
              localStorage.removeItem(ADMIN_SESSION_KEY);
              setIsAdmin(false);
            }
          } else {
            console.log("No user found");
            localStorage.removeItem(ADMIN_SESSION_KEY);
            setIsAdmin(false);
          }
        } else {
          console.log("No admin session found");
        }
      } catch (err) {
        console.error("Error checking admin session:", err);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Attempting admin login with:", { email });
      
      // First, check if the email matches the expected admin email
      // This can help detect case-sensitivity issues or typos
      const { data: adminCheck, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
        
      if (adminCheckError) {
        console.error("Error checking admin email:", adminCheckError);
        // Continue with sign in attempt anyway
      }
      
      if (!adminCheck) {
        console.log("Admin email not found in database. Continuing with auth attempt anyway.");
      } else {
        console.log("Admin email found in database:", adminCheck);
      }
      
      // Sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
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
      
      // Check if the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();
      
      if (adminError) {
        console.error("Error checking admin status:", adminError);
        toast.error(`Erro ao verificar permissões: ${adminError.message}`);
        await supabase.auth.signOut();
        setIsAdmin(false);
        return false;
      }
      
      if (!adminData) {
        console.error("User is not an admin");
        toast.error("Usuário não tem permissões administrativas");
        await supabase.auth.signOut();
        setIsAdmin(false);
        return false;
      }
      
      console.log("Admin verified:", adminData);
      
      // Set the admin session
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      setIsAdmin(true);
      toast.success("Login administrativo bem-sucedido");
      navigate("/admin/dashboard");
      return true;
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

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
