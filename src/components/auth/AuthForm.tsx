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
  const [connectionErrorDetails, setConnectionErrorDetails] = useState<string>("");

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
            setConnectionErrorDetails(`Erro de conexão: ${error.message}`);
            setShowConnectionError(true);
            throw error;
          }
          throw error;
        }

        console.log('Registration successful:', data);
        
        // Update local storage email for the transition period
        updateCurrentUserEmail(email);
        
        toast.success("Conta criada com sucesso!", { 
          description: "Verifique seu email para confirmar sua conta."
        });
        
        navigate("/dashboard");
      } else {
        // Login
        console.log(`Attempting to login with email: ${email}`);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Login error:', error);
          
          if (error.message.includes('fetch') || error.message === 'Failed to fetch') {
            // Network error
            setConnectionErrorDetails(`Erro de conexão: ${error.message}`);
            setShowConnectionError(true);
            throw error;
          }
          throw error;
        }
        
        console.log('Login successful:', data);
        
        // Update local storage email for the transition period
        updateCurrentUserEmail(email);

        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (!showConnectionError) {
        toast.error(error.message || "Ocorreu um erro durante a autenticação.");
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
          setConnectionErrorDetails(`Erro de conexão: ${error.message}`);
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
      console.error("Password reset error details:", error);
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
              <p className="mb-2">
                Não foi possível se conectar ao servidor de autenticação. Estamos usando credenciais de demonstração que permitem que o aplicativo inicialize, mas não funcionam para autenticação real.
              </p>
              
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-md border border-amber-200 dark:border-amber-800">
                <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                  Para resolver este problema:
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                  <li>Crie uma conta no Supabase (supabase.com)</li>
                  <li>Crie um novo projeto</li>
                  <li>Vá para as configurações do projeto na seção API</li>
                  <li>Copie a URL do projeto e a chave anônima</li>
                  <li>Substitua os valores no arquivo .env que criamos para você</li>
                  <li>Reinicie a aplicação</li>
                </ol>
              </div>
              
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {connectionErrorDetails ? `Detalhes técnicos: ${connectionErrorDetails}` : ''}
              </p>
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
