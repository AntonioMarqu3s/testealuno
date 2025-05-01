
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
        
        // For demo mode, we allow proceeding even without real authentication
        updateCurrentUserEmail(email);
        
        toast.success("Conta criada com sucesso!", { 
          description: "O sistema está operando em modo de demonstração. Você agora pode navegar pelo aplicativo."
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
        
        // For demo mode, we allow proceeding even without real authentication
        updateCurrentUserEmail(email);

        toast.success("Login realizado com sucesso em modo de demonstração!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      // If we already showed the connection error dialog, don't show another toast
      if (!showConnectionError) {
        if (error.message?.includes('Invalid login credentials')) {
          toast.error("Email ou senha incorretos");
        } else if (error.message?.includes('User already registered')) {
          toast.error("Este email já está registrado");
          // Auto switch to login tab for convenience
          const loginTab = document.querySelector('[data-state="inactive"][value="login"]') as HTMLElement;
          if (loginTab) loginTab.click();
        } else {
          toast.error(error.message || "Ocorreu um erro durante a autenticação.");
        }
      }
      console.error("Auth error details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // For demonstration purposes only
    const demoEmail = "demo@example.com";
    updateCurrentUserEmail(demoEmail);
    toast.success("Login de demonstração realizado!", {
      description: "Você está usando o aplicativo em modo de demonstração."
    });
    navigate("/dashboard");
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
          </TabsContent>
        </Tabs>
      </Card>

      {/* Connection Error Dialog */}
      <AlertDialog open={showConnectionError} onOpenChange={closeConnectionErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modo de Demonstração</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>
                  O aplicativo está operando em modo de demonstração com credenciais que permitem visualizar a interface, mas não fornecem autenticação real.
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800">
                  <p className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                    Para usar a autenticação completa:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                    <li>Use o botão "Modo de Demonstração" para explorar o aplicativo sem autenticação real</li>
                  </ol>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {connectionErrorDetails ? `Detalhes técnicos: ${connectionErrorDetails}` : ''}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConnectionErrorDialog}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDemoLogin}>
              Usar Modo de Demonstração
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
