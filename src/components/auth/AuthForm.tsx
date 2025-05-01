
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function AuthForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showConnectionError, setShowConnectionError] = useState<boolean>(false);

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
        
        if (error) {
          if (error.message.includes('fetch') || error.message === 'Failed to fetch') {
            // Network error
            setShowConnectionError(true);
            throw error;
          }
          throw error;
        }

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
        
        if (error) {
          if (error.message.includes('fetch') || error.message === 'Failed to fetch') {
            // Network error
            setShowConnectionError(true);
            throw error;
          }
          throw error;
        }
        
        // Update local storage email for the transition period
        updateCurrentUserEmail(email);

        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (!showConnectionError) {
        toast.error(error.message || "Ocorreu um erro durante a autenticação.");
      }
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
      
      if (error) {
        if (error.message.includes('fetch') || error.message === 'Failed to fetch') {
          setShowConnectionError(true);
          throw error;
        }
        throw error;
      }
      
      toast.success("Email de redefinição de senha enviado!", {
        description: "Verifique sua caixa de entrada."
      });
    } catch (error: any) {
      if (!showConnectionError) {
        toast.error(error.message || "Não foi possível enviar o email de redefinição de senha.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeConnectionErrorDialog = () => {
    setShowConnectionError(false);
  };

  return (
    <>
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

      {/* Connection Error Dialog */}
      <AlertDialog open={showConnectionError} onOpenChange={closeConnectionErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erro de Conexão</AlertDialogTitle>
            <AlertDialogDescription>
              Não foi possível se conectar ao servidor de autenticação. Isso pode ocorrer pelos seguintes motivos:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Suas credenciais do Supabase não estão configuradas corretamente</li>
                <li>O arquivo .env não foi criado com base no .env.example</li>
                <li>Você está enfrentando problemas de conexão com a internet</li>
              </ul>
              <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md mt-3 border border-amber-200 dark:border-amber-800">
                <p className="text-amber-800 dark:text-amber-300 text-sm">
                  <strong>Solução:</strong> Crie um arquivo .env na raiz do projeto com suas credenciais do Supabase e reinicie a aplicação.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConnectionErrorDialog}>Fechar</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.location.reload()}>
              Recarregar página
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
