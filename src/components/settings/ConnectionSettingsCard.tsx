
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useConnectionToggle } from "@/hooks/useConnectionToggle";

interface ConnectionSettingsCardProps {
  initialConnectionValue: boolean;
}

export function ConnectionSettingsCard({ initialConnectionValue }: ConnectionSettingsCardProps) {
  const { user } = useAuth();
  const { 
    connectInstancia, 
    setConnectInstancia,
    isUpdatingConnection, 
    handleConnectionToggle 
  } = useConnectionToggle(initialConnectionValue);

  useEffect(() => {
    setConnectInstancia(initialConnectionValue);
  }, [initialConnectionValue, setConnectInstancia]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Conexão</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Conectar instâncias automaticamente</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ao ativar, novos agentes tentarão se conectar automaticamente quando criados
            </p>
          </div>
          <Switch 
            checked={connectInstancia}
            onCheckedChange={() => handleConnectionToggle(user?.id)}
            disabled={isUpdatingConnection}
          />
        </div>
      </CardContent>
    </Card>
  );
}
