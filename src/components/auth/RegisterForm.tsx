
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { updateCurrentUserEmail } from "@/services/user/userService";

interface RegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  onSuccessfulAuth: () => void;
  onShowConnectionError: (errorDetails: string) => void;
  handleDemoLogin: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({
  email,
  setEmail,
  isLoading,
  setIsLoading,
  onSuccessfulAuth,
  onShowConnectionError,
  handleDemoLogin,
  onSwitchToLogin
}: RegisterFormProps) {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    
    setIsLoading(true);

    try {
      console.log(`Attempting to register with email: ${email}`);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`,
          data: {
            email // Store email in user metadata
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        
        if (error.message.includes('fetch') || error.message === 'Failed to fetch') {
          // Network error
          onShowConnectionError(`Erro de conexão: ${error.message}`);
          throw error;
        }
        throw error;
      }

      console.log('Registration successful:', data);
      
      // For demo mode, we allow proceeding even without real authentication
      updateCurrentUserEmail(email);
      
      toast.success("Conta criada com sucesso!", { 
        description: "O sistema está operando em modo de demonstração. Você agora pode navegar pelo aplicativo."
      });
      
      onSuccessfulAuth();
    } catch (error: any) {
      if (error.message?.includes('User already registered')) {
        toast.error("Este email já está registrado");
        // Auto switch to login tab for convenience
        onSwitchToLogin();
      } else {
        toast.error(error.message || "Ocorreu um erro durante a autenticação.");
      }
      console.error("Auth error details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <Input 
            id="register-email" 
            type="email" 
            placeholder="seu@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">Senha</Label>
          <Input 
            id="register-password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Senha</Label>
          <Input 
            id="confirm-password" 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? "Criando conta..." : "Criar conta"}
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
