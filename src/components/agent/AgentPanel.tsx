
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, QrCode, MessageSquare } from "lucide-react";
import { toast } from "sonner";

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

export const AgentPanel: React.FC<AgentPanelProps> = ({ agent }) => {
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const handleGenerateQrCode = () => {
    setIsGeneratingQR(true);
    
    // Simulando geração de QR code
    setTimeout(() => {
      setIsGeneratingQR(false);
      toast.success("QR Code gerado com sucesso!", {
        description: `O QR Code para o agente ${agent.name} foi gerado e está disponível para download.`
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{agent.name}</CardTitle>
          <Badge variant={agent.isConnected ? "default" : "outline"}>
            {agent.isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Criado em: {agent.createdAt.toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm mb-4">Tipo: <span className="font-medium">{agent.type}</span></p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-2">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={handleGenerateQrCode}
          disabled={isGeneratingQR}
        >
          <QrCode className="mr-2 h-4 w-4" /> 
          {isGeneratingQR ? "Gerando..." : "Gerar QR Code"}
        </Button>
        <Button asChild className="flex-1">
          <Link to={`/agent-analytics/${agent.id}`}>
            <BarChart className="mr-2 h-4 w-4" /> Análise
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
