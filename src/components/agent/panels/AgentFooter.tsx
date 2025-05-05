import React from "react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, QrCode, WifiOff } from "lucide-react";
import { Agent } from "../AgentTypes";

interface AgentFooterProps {
  agent: Agent;
  onGenerateQR: () => void;
  onDisconnect: () => void;
  isGeneratingQR: boolean;
  isDisconnecting: boolean;
}

export const AgentFooter: React.FC<AgentFooterProps> = ({
  agent,
  onGenerateQR,
  onDisconnect,
  isGeneratingQR,
  isDisconnecting
}) => {
  return (
    <CardFooter className="flex justify-between gap-2 pt-2">
      {agent.isConnected ? (
        <Button 
          variant="outline" 
          className="flex-1 text-red-600 border-red-200 hover:bg-red-50" 
          onClick={onDisconnect}
          disabled={isDisconnecting}
        >
          <WifiOff className="mr-2 h-4 w-4" /> 
          {isDisconnecting ? "Desconectando..." : "Desconectar"}
        </Button>
      ) : (
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={onGenerateQR}
          disabled={isGeneratingQR}
        >
          <QrCode className="mr-2 h-4 w-4" /> 
          {isGeneratingQR ? "Gerando..." : "Gerar QR Code"}
        </Button>
      )}
      <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700">
        <Link to={`/agent-analytics/${agent.id}`}>
          <BarChart className="mr-2 h-4 w-4" /> Análise
        </Link>
      </Button>
    </CardFooter>
  );
};
