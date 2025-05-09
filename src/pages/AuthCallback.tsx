
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan, PlanType } from "@/services/plan/userPlanService";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verificando sua autenticação...");
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the URL hash (Supabase auth redirects with hash params)
      const hashParams = window.location.hash;
      
      if (hashParams) {
        try {
          // Attempt to exchange the auth code for a session
          setMessage("Confirmando seu email...");
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data.session) {
            toast.success("Email confirmado com sucesso!");
            
            // Remove hash from URL to prevent issues when refreshing
            if (window.history && window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
            
            // Use a simple timeout to navigate
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1500);
          } else {
            throw new Error("Falha ao confirmar email.");
          }
        } catch (error: any) {
          console.error("Auth callback error:", error);
          setMessage("Erro ao confirmar seu email. Por favor, tente novamente.");
          toast.error("Erro de autenticação", {
            description: error.message || "Falha na verificação do email"
          });
          setTimeout(() => navigate('/auth', { replace: true }), 3000);
        }
      } else {
        // No hash parameters, redirect to auth
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Autenticação em andamento</h1>
        <p className="text-muted-foreground mb-4">{message}</p>
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
