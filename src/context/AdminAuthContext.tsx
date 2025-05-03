
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
        // First check localStorage for admin flag
        const adminSession = localStorage.getItem(ADMIN_SESSION_KEY);
        console.log("Initial check for admin session:", adminSession);
        
        if (adminSession === "true") {
          // Verify with Supabase if session is valid
          const { data } = await supabase.auth.getSession();
          const session = data.session;
          
          if (!session) {
            console.log("No valid session found, removing admin flag");
            localStorage.removeItem(ADMIN_SESSION_KEY);
            setIsAdmin(false);
            setIsLoading(false);
            return;
          }
          
          // We have a session, verify if user is admin
          const userId = session.user.id;
          console.log("Found authenticated user:", userId);
          
          // Check admin_users table
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (adminError) {
            console.error("Error checking admin status:", adminError);
            localStorage.removeItem(ADMIN_SESSION_KEY);
            setIsAdmin(false);
          } else if (adminData) {
            console.log("User confirmed as admin:", adminData);
            setIsAdmin(true);
          } else {
            console.log("User is not an admin");
            localStorage.removeItem(ADMIN_SESSION_KEY);
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error("Error in admin session check:", err);
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, removing admin status");
          setIsAdmin(false);
          localStorage.removeItem(ADMIN_SESSION_KEY);
          return;
        }
        
        if (session?.user) {
          // We need to check if the user is an admin, but we can't do this
          // directly in the callback as it could cause issues with Supabase's
          // auth state management. Use setTimeout to defer this check.
          setTimeout(async () => {
            try {
              const { data: adminData, error: adminError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
                
              if (adminError) {
                console.error("Error checking admin status in auth change:", adminError);
                return;
              }
                
              if (adminData) {
                console.log("User confirmed as admin via auth state change");
                setIsAdmin(true);
                localStorage.setItem(ADMIN_SESSION_KEY, "true");
              } else {
                console.log("User is not an admin");
                setIsAdmin(false);
                localStorage.removeItem(ADMIN_SESSION_KEY);
              }
            } catch (err) {
              console.error("Error checking admin status on auth change:", err);
            }
          }, 0);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Attempting admin login with:", { email });
      
      // Use fixed credentials for admin
      const fixedEmail = "admin@example.com";
      const fixedPassword = "@admin123456";
      
      // Normalize email (lowercase)
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if using the fixed admin credentials
      if (normalizedEmail !== fixedEmail) {
        console.error("Invalid admin email");
        toast.error("Email de administrador inválido");
        return false;
      }
      
      // Sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: fixedEmail, // Always use the fixed email
        password: password  // Use the provided password
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
      
      // Check if the user is an admin in the admin_users table
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
