import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { updateCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan, PlanType } from "@/services/plan/userPlanService";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  onSuccessfulAuth: () => void;
  onShowConnectionError: (errorDetails: string) => void;
  handleDemoLogin: () => void;
}

export function LoginForm({
  email,
  setEmail,
  isLoading,
  setIsLoading,
  onSuccessfulAuth,
  onShowConnectionError,
  handleDemoLogin
}: LoginFormProps) {
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log(`Attempting to login with email: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        
        if (error.message.includes('fetch') || error.message === 'Failed to fetch') {
          // Network error
          onShowConnectionError(`Erro de conexão: ${error.message}`);
          throw error;
        }
        throw error;
      }
      
      if (data && data.session) {
        console.log('Login successful:', data);
        
        // Update local storage with email for backward compatibility
        updateCurrentUserEmail(email);

        toast.success("Login realizado com sucesso!");
        
        // Clear form fields
        setPassword("");
        
        // Check if user needs to select a plan first
        const userPlan = getUserPlan(email);
        
        if (userPlan.plan === PlanType.FREE_TRIAL) {
          // Redirect to plan checkout if user doesn't have a paid plan
          window.location.href = '/plan-checkout';
        } else {
          // Redirect to dashboard
          onSuccessfulAuth();
        }
      } else {
        throw new Error("Falha na autenticação.");
      }
    } catch (error: any) {
      // If we already showed the connection error dialog, don't show another toast
      if (!error.message?.includes('fetch') && error.message !== 'Failed to fetch') {
        if (error.message?.includes('Invalid login credentials')) {
          toast.error("Email ou senha incorretos");
        } else {
          toast.error(error.message || "Ocorreu um erro durante a autenticação.");
        }
      }
      console.error("Auth error details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Por favor, insira seu email primeiro.");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`Attempting to send reset password email to: ${email}`);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Reset password error:', error);
        
        if (error.message.includes('fetch') || error.message === 'Failed to fetch') {
          onShowConnectionError(`Erro de conexão: ${error.message}`);
          throw error;
        }
        throw error;
      }
      
      toast.success("Email de redefinição de senha enviado!", {
        description: "Verifique sua caixa de entrada."
      });
    } catch (error: any) {
      toast.error(error.message || "Não foi possível enviar o email de redefinição de senha.");
      console.error("Password reset error details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="seu@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Button 
              type="button"
              variant="link" 
              className="px-0 h-auto text-xs"
              onClick={handleResetPassword}
            >
              Esqueceu a senha?
            </Button>
          </div>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          className="w-full mt-2"
          onClick={handleDemoLogin}
        >
          Modo de Demonstração
        </Button>
      </CardFooter>
    </form>
  );
}
