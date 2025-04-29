
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, QrCode, MessageSquare, WifiOff, Wifi, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  createdAt: Date;
  instanceId?: string; // New instance ID field
}

interface AgentPanelProps {
  agent: Agent;
  onDelete?: (agentId: string) => void;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ agent, onDelete }) => {
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

  const handleDelete = () => {
    if (onDelete) {
      onDelete(agent.id);
      toast.success("Agente removido com sucesso!");
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-2 pt-6 relative">
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to={`/edit-agent/${agent.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o agente "{agent.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex justify-between items-center mt-2">
          <CardTitle className="text-xl">{agent.name}</CardTitle>
          <Badge variant={agent.isConnected ? "default" : "outline"} className="flex items-center gap-1">
            {agent.isConnected ? (
              <>
                <Wifi className="h-3 w-3" /> 
                <span>Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" /> 
                <span>Desconectado</span>
              </>
            )}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Criado em: {agent.createdAt.toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm mb-2">Tipo: <span className="font-medium">{agent.type}</span></p>
        {agent.instanceId && (
          <p className="text-xs text-muted-foreground mb-2">
            ID da Instância: <span className="font-mono">{agent.instanceId}</span>
          </p>
        )}
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
