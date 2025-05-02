
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { updateCurrentUserEmail } from "@/services/user/userService";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ConnectionErrorDialog } from "./ConnectionErrorDialog";

export function AuthForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [showConnectionError, setShowConnectionError] = useState<boolean>(false);
  const [connectionErrorDetails, setConnectionErrorDetails] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("login");

  const handleSuccessfulAuth = () => {
    navigate("/dashboard");
  };

  const showConnectionErrorDialog = (errorDetails: string) => {
    setConnectionErrorDetails(errorDetails);
    setShowConnectionError(true);
  };

  const closeConnectionErrorDialog = () => {
    setShowConnectionError(false);
  };

  const handleSwitchToLogin = () => {
    setActiveTab("login");
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/ae7fc171-78fa-4833-b4b7-66e45c9191ab.png" 
                  alt="Agente Conecta A.I." 
                  className="h-8"
                />
              </div>
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
            <LoginForm
              email={email}
              setEmail={setEmail}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onSuccessfulAuth={handleSuccessfulAuth}
              onShowConnectionError={showConnectionErrorDialog}
            />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm
              email={email}
              setEmail={setEmail}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onSuccessfulAuth={handleSuccessfulAuth}
              onShowConnectionError={showConnectionErrorDialog}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </TabsContent>
        </Tabs>
      </Card>

      <ConnectionErrorDialog
        open={showConnectionError}
        onClose={closeConnectionErrorDialog}
        onDemoLogin={() => {}}
        errorDetails={connectionErrorDetails}
      />
    </>
  );
}
