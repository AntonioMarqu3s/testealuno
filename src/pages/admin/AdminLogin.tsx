
import React, { useState, useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingInitialAdmin, setIsCreatingInitialAdmin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { adminLogin } = useAdminAuth();
  const [initialAdminMessage, setInitialAdminMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("login");

  // Switch to login tab when admin credentials are created
  useEffect(() => {
    if (initialAdminMessage) {
      setActiveTab("login");
      
      // Extract email from credentials message
      const emailMatch = initialAdminMessage.match(/Email:\s*([^\s]+)/);
      if (emailMatch && emailMatch[1]) {
        setEmail(emailMatch[1]);
      }
    }
  }, [initialAdminMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      console.log("Attempting admin login with:", { email, password });
      const success = await adminLogin(email, password);
      
      if (!success) {
        setLoginError("Falha na autenticação. Verifique seu email e senha.");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setLoginError(`Erro ao autenticar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createInitialAdmin = async () => {
    setIsCreatingInitialAdmin(true);
    setInitialAdminMessage(null);
    setLoginError(null);
    
    try {
      console.log("Creating initial admin...");
      const { data, error } = await supabase.functions.invoke("create-initial-admin");
      
      if (error) {
        console.error("Error invoking create-initial-admin function:", error);
        throw error;
      }
      
      console.log("Create admin response:", data);
      
      if (data.success) {
        const credentialMessage = `
          Credencial inicial criada com sucesso!
          Email: ${data.credentials.email}
          Senha: ${data.credentials.password}
        `;
        setInitialAdminMessage(credentialMessage);
        setEmail(data.credentials.email);
        setPassword(""); // Limpa a senha para que o usuário precise digitar
        toast.success("Administrador inicial criado com sucesso!");
        setActiveTab("login");
      } else {
        toast.error(`Erro ao criar administrador inicial: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating initial admin:", error);
      toast.error(`Erro ao criar administrador inicial: ${error.message}`);
    } finally {
      setIsCreatingInitialAdmin(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
          <CardDescription>
            Entre com suas credenciais administrativas para gerenciar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="setup">Configuração Inicial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@exemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                {loginError && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Autenticando...
                    </span>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
              
              {initialAdminMessage && (
                <Alert className="bg-green-50 border-green-200 mt-4">
                  <AlertDescription className="whitespace-pre-line">
                    {initialAdminMessage}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="setup" className="space-y-4 pt-4">
              <Alert>
                <Info className="h-5 w-5" />
                <AlertDescription>
                  Se for seu primeiro acesso, crie uma credencial administrativa inicial.
                  Depois de fazer login, você poderá alterar a senha e criar outros administradores.
                </AlertDescription>
              </Alert>
              
              {initialAdminMessage && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="whitespace-pre-line">
                    {initialAdminMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                className="w-full" 
                onClick={createInitialAdmin}
                disabled={isCreatingInitialAdmin}
              >
                {isCreatingInitialAdmin ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Criando...
                  </span>
                ) : (
                  "Criar Administrador Inicial"
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
