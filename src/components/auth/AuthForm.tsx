
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { updateCurrentUserEmail } from "@/services/user/userService";

export function AuthForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent, mode: 'login' | 'register') => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          toast.error("As senhas não coincidem!");
          setIsLoading(false);
          return;
        }
        
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
        
        if (error) throw error;

        // Update local storage email for the transition period
        updateCurrentUserEmail(email);
        
        toast.success("Conta criada com sucesso!", { 
          description: "Verifique seu email para confirmar sua conta."
        });
        
        navigate("/dashboard");
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        // Update local storage email for the transition period
        updateCurrentUserEmail(email);

        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro durante a autenticação.");
      console.error(error);
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Email de redefinição de senha enviado!", {
        description: "Verifique sua caixa de entrada."
      });
    } catch (error: any) {
      toast.error(error.message || "Não foi possível enviar o email de redefinição de senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <Tabs defaultValue="login">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Agent Hub</CardTitle>
            <TabsList>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>
          </div>
          <CardDescription>
            Crie e gerencie seus agentes de IA personalizados
          </CardDescription>
        </CardHeader>
        <TabsContent value="login">
          <form onSubmit={(e) => handleSubmit(e, 'login')}>
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
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="register">
          <form onSubmit={(e) => handleSubmit(e, 'register')}>
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
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
