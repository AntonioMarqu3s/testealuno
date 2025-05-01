
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, QrCode, MessageSquare, Wifi, WifiOff, Trash2, Edit, Mail, Timer, Check } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUserEmail } from "@/services";
import { getTrialDaysRemaining, hasTrialExpired } from "@/services/plan/userPlanService";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  createdAt: Date;
  instanceId?: string;
  clientIdentifier?: string;
}

interface AgentPanelProps {
  agent: Agent;
  onDelete?: (agentId: string) => void;
}

// Map to translate agent type codes to friendly names
const agentTypeMap: Record<string, string> = {
  "sales": "Vendedor",
  "sdr": "SDR",
  "closer": "Closer",
  "support": "Atendimento",
  "custom": "Personalizado",
};

export const AgentPanel: React.FC<AgentPanelProps> = ({ agent, onDelete }) => {
  const navigate = useNavigate();
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [timerCount, setTimerCount] = useState(30);
  const [timerInterval, setTimerIntervalState] = useState<number | null>(null);
  const userEmail = getCurrentUserEmail();
  
  // Trial period information
  const trialDaysRemaining = getTrialDaysRemaining(userEmail);
  const isTrialExpired = hasTrialExpired(userEmail);
  const isInTrialPeriod = trialDaysRemaining > 0 && !isTrialExpired;

  const handleGenerateQrCode = async () => {
    setIsGeneratingQR(true);
    setShowQRDialog(true);
    
    try {
      // Create instance name in the format expected by the webhook
      const instanceName = `${agentTypeMap[agent.type] || agent.type} - ${agent.name}`;
      
      // Call webhook to generate QR code
      const response = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/criar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let imgSrc;
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const base64Data = data.mensagem || data.qrCodeBase64;
        
        if (!base64Data) {
          throw new Error('Invalid response format');
        }
        
        imgSrc = `data:image/png;base64,${base64Data}`;
      } else {
        const blob = await response.blob();
        imgSrc = URL.createObjectURL(blob);
      }
      
      setQrCodeImage(imgSrc);
      
      // Start timer for QR code updates
      startQRCodeUpdateTimer(instanceName);
      toast.success("QR Code gerado com sucesso");
      
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Erro ao gerar QR Code");
    } finally {
      setIsGeneratingQR(false);
    }
  };
  
  const handleDisconnect = async () => {
    if (!agent.instanceId) return;
    
    setIsDisconnecting(true);
    
    try {
      // Call disconnect webhook
      const response = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/desconectar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceId: agent.instanceId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect instance');
      }
      
      toast.success("Agente desconectado com sucesso");
      
      // Update local state to show disconnected status
      // This would typically be done via a parent component update
      // For now, we'll just reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Error disconnecting agent:", error);
      toast.error("Erro ao desconectar agente");
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  const startQRCodeUpdateTimer = (instanceName: string) => {
    setTimerCount(30);
    
    // Clear any existing interval
    if (timerInterval) {
      window.clearInterval(timerInterval);
    }
    
    // Set new interval
    const intervalId = window.setInterval(() => {
      setTimerCount((prevCount) => {
        if (prevCount <= 1) {
          // Update QR code
          updateQRCode(instanceName);
          return 30;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    // Store interval ID for cleanup
    setTimerIntervalState(intervalId);
  };
  
  const updateQRCode = async (instanceName: string) => {
    try {
      const response = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/atualizar-qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update QR code');
      }
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let imgSrc;
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const base64Data = data.mensagem || data.qrCodeBase64;
        
        if (!base64Data) {
          throw new Error('Invalid response format');
        }
        
        imgSrc = `data:image/png;base64,${base64Data}`;
      } else {
        const blob = await response.blob();
        imgSrc = URL.createObjectURL(blob);
      }
      
      setQrCodeImage(imgSrc);
      toast.info("QR Code atualizado");
      
    } catch (error) {
      console.error("Error updating QR code:", error);
      toast.error("Erro ao atualizar QR Code");
    }
  };
  
  // Clean up interval on unmount
  React.useEffect(() => {
    return () => {
      if (timerInterval) {
        window.clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);
  
  const handleCloseQRDialog = () => {
    setShowQRDialog(false);
    if (timerInterval) {
      window.clearInterval(timerInterval);
      setTimerIntervalState(null);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(agent.id);
      toast.success("Agente removido com sucesso!");
    }
  };

  const handleEdit = () => {
    // Prepare agent data for editing and navigate
    sessionStorage.setItem('editingAgent', JSON.stringify(agent));
    navigate(`/edit-agent/${agent.id}?type=${agent.type}`);
  };

  // Get friendly agent type name or use the raw type if not found in map
  const agentTypeName = agentTypeMap[agent.type] || agent.type;
  
  // Format date to look like the image (DD/MM/YYYY)
  const formattedDate = new Date(agent.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Create displayed instance ID per requirements
  const displayInstanceId = agent.instanceId || 
    (userEmail ? `${userEmail}-${agent.name.replace(/\s+/g, '')}` : 'Instance ID not available');

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-2 pt-6 relative">
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
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
          Criado em: {formattedDate}
        </p>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm mb-2">Tipo: <span className="font-medium">{agentTypeName}</span></p>
        
        {userEmail && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Mail className="h-3 w-3 mr-1" />
            <span>{userEmail}</span>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mb-2">
          ID da Instância: <span className="font-mono">{displayInstanceId}</span>
        </p>
        
        {agent.clientIdentifier && (
          <p className="text-xs text-muted-foreground mb-2">
            Cliente: <span className="font-mono">{agent.clientIdentifier}</span>
          </p>
        )}
        
        {/* Trial period information */}
        {isInTrialPeriod && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
              <Timer className="h-3 w-3" />
              <span>Período de teste: {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia' : 'dias'}</span>
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-2">
        {agent.isConnected ? (
          <Button 
            variant="outline" 
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50" 
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            <WifiOff className="mr-2 h-4 w-4" /> 
            {isDisconnecting ? "Desconectando..." : "Desconectar"}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleGenerateQrCode}
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
      
      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={handleCloseQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code do Agente</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code com o aplicativo WhatsApp para conectar seu agente
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            {qrCodeImage ? (
              <>
                <div className="mb-4 border rounded-lg p-2 overflow-hidden">
                  <img 
                    src={qrCodeImage} 
                    alt="QR Code" 
                    className="w-full h-auto max-w-[240px]"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Novo QR Code em: <span className="font-bold">{timerCount}s</span>
                </p>
              </>
            ) : (
              <div className="flex justify-center items-center h-[240px] w-[240px]">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
