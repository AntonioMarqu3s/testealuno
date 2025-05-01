
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, BarChart, WifiOff } from "lucide-react";
import { Agent } from "./AgentTypes";

interface AgentConfirmationPanelProps {
  agent: Agent;
  onClose: () => void;
  onAnalyze?: () => void;
  onGenerateQR?: () => void;
}

const AgentConfirmationPanel: React.FC<AgentConfirmationPanelProps> = ({
  agent,
  onClose,
  onAnalyze,
  onGenerateQR
}) => {
  // Map to translate agent type codes to friendly names
  const agentTypeMap: Record<string, string> = {
    "sales": "sales",
    "sdr": "SDR",
    "closer": "Closer",
    "support": "Atendimento",
    "custom": "Personalizado",
  };

  const typeName = agentTypeMap[agent.type] || agent.type;
  const formattedDate = new Date(agent.createdAt).toLocaleDateString();

  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{agent.name}</h2>
            <p className="text-sm text-muted-foreground">
              Criado em: {formattedDate}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-destructive"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <WifiOff className="h-3 w-3" /> 
            <span>Desconectado</span>
          </Badge>
        </div>
        <p className="text-sm">Tipo: <span className="font-medium">{typeName}</span></p>
        <p className="text-xs text-muted-foreground">
          ID da Instância: <span className="font-mono">{agent.instanceId}</span>
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-4">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={onGenerateQR}
        >
          <QrCode className="mr-2 h-4 w-4" /> Gerar QR Code
        </Button>
        <Button 
          className="flex-1 bg-purple-600 hover:bg-purple-700"
          onClick={onAnalyze}
        >
          <BarChart className="mr-2 h-4 w-4" /> Análise
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentConfirmationPanel;
