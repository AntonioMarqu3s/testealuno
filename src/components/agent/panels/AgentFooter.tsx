
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { QrCode, Power, Loader2, RefreshCw } from "lucide-react";
import { Agent } from "../AgentTypes";

interface AgentFooterProps {
  agent: Agent;
  onGenerateQR: () => void;
  onDisconnect: () => void;
  isGeneratingQR: boolean;
  isDisconnecting?: boolean;
  connectionCheckFailed?: boolean;
}

export const AgentFooter = ({
  agent,
  onGenerateQR,
  onDisconnect,
  isGeneratingQR,
  isDisconnecting = false,
  connectionCheckFailed = false
}: AgentFooterProps) => {
  if (!agent) return null;

  return (
    <CardFooter className="flex justify-between border-t p-4">
      {agent.isConnected ? (
        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={onDisconnect}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Desconectando...
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4" />
              Desconectar
            </>
          )}
        </Button>
      ) : (
        <>
          {connectionCheckFailed ? (
            <div className="w-full flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onGenerateQR}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Verificar Novamente
              </Button>
              <Button 
                variant="default" 
                className="flex-1"
                onClick={onGenerateQR}
                disabled={isGeneratingQR}
              >
                {isGeneratingQR ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    QR Code
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              className="w-full"
              onClick={onGenerateQR}
              disabled={isGeneratingQR}
            >
              {isGeneratingQR ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Gerar QR Code
                </>
              )}
            </Button>
          )}
        </>
      )}
    </CardFooter>
  );
};
