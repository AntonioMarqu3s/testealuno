
import { useState } from "react";
import { User, QrCode, WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  createdAt: Date;
}

interface AgentPanelProps {
  agent: Agent;
}

export function AgentPanel({ agent }: AgentPanelProps) {
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const handleGenerateQR = () => {
    setIsGeneratingQR(true);
    
    // Simulação - normalmente aqui você faria uma chamada à API
    setTimeout(() => {
      setIsGeneratingQR(false);
    }, 1500);
  };

  return (
    <Card className="overflow-hidden">
      <div 
        className={cn(
          "h-2 w-full bg-gradient-to-r", 
          agent.isConnected ? "from-green-500 to-green-700" : "from-gray-500 to-gray-700"
        )}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>{agent.name}</CardTitle>
          </div>
          <Badge 
            variant={agent.isConnected ? "default" : "outline"}
            className="flex items-center gap-1"
          >
            {agent.isConnected 
              ? <><Wifi className="h-3 w-3" /> Conectado</>
              : <><WifiOff className="h-3 w-3" /> Desconectado</>
            }
          </Badge>
        </div>
        <CardDescription>
          Tipo: {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Criado em {agent.createdAt.toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateQR} 
          className="w-full"
          disabled={isGeneratingQR}
        >
          <QrCode className="h-4 w-4 mr-2" />
          {isGeneratingQR ? "Gerando QR Code..." : "Gerar QR Code"}
        </Button>
      </CardFooter>
    </Card>
  );
}
