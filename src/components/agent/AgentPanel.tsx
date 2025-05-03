
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { getCurrentUserEmail } from "@/services";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";

import { Agent } from "./AgentTypes";
import { AgentHeader } from "./panels/AgentHeader";
import { AgentContent } from "./panels/AgentContent";
import { AgentFooter } from "./panels/AgentFooter";
import { DeleteAgentDialog } from "./panels/DeleteAgentDialog";
import { QRCodeDialog } from "./panels/QRCodeDialog";
import { useQRCodeGeneration } from "./hooks/useQRCodeGeneration";
import { useAgentConnection } from "./hooks/useAgentConnection";

interface AgentPanelProps {
  agent: Agent;
  onDelete?: (agentId: string) => void;
  onToggleConnection?: (agentId: string, isConnected: boolean) => void;
  autoShowQR?: boolean;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ 
  agent, 
  onDelete, 
  onToggleConnection,
  autoShowQR = false
}) => {
  const navigate = useNavigate();
  const userEmail = getCurrentUserEmail();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(agent.isConnected || agent.connectInstancia || false);
  const [hasAutoShowQRTriggered, setHasAutoShowQRTriggered] = useState(false);
  const [connectionCheckFailed, setConnectionCheckFailed] = useState(false);
  
  // Custom hooks for QR code and connection
  const { 
    showQRCodeDialog, 
    setShowQRCodeDialog,
    qrCodeImage, 
    isGeneratingQRCode,
    timerCount,
    connectionCheckAttempts,
    handleShowQRCode,
    handleCloseQRCode 
  } = useQRCodeGeneration(agent.instanceId, agent.clientIdentifier);
  
  const { isDisconnecting, isCheckingStatus, handleDisconnect, checkConnectionStatus } = useAgentConnection();

  // Check connection status when component mounts
  useEffect(() => {
    if (agent.instanceId) {
      const verifyStatus = async () => {
        try {
          console.log("Verificando status de conexão do agente:", agent.name);
          setConnectionCheckFailed(false);
          
          // Primeiro verifica se o agente está marcado como conectado no estado local
          if (agent.isConnected || agent.connectInstancia) {
            const connected = await checkConnectionStatus(agent.instanceId, agent.id);
            
            // Apenas atualiza se o status de conexão for diferente
            if (connected !== isConnected) {
              console.log(`Status de conexão alterado para o agente ${agent.name}: ${connected}`);
              setIsConnected(connected);
              
              // Atualiza o estado do componente pai se o callback for fornecido
              if (onToggleConnection) {
                onToggleConnection(agent.id, connected);
              }
            }
          }
        } catch (error) {
          console.error("Erro ao verificar status de conexão:", error);
          setConnectionCheckFailed(true);
          // Não atualiza o status em caso de erro, mantém o estado atual
        }
      };
      
      // Executa a verificação, mas não trava a UI se falhar
      verifyStatus().catch(error => {
        console.error("Erro não tratado na verificação de status:", error);
      });
    }
  }, [agent.instanceId, agent.id, agent.name, agent.isConnected, agent.connectInstancia, checkConnectionStatus, isConnected, onToggleConnection]);

  // Handle auto show QR code when directed from agent creation - only trigger once
  useEffect(() => {
    if (autoShowQR && !showQRCodeDialog && !hasAutoShowQRTriggered) {
      console.log("Auto mostrando QR code para o agente:", agent.name);
      setHasAutoShowQRTriggered(true);
      setTimeout(() => handleShowQRCode(), 300);
    }
  }, [autoShowQR, agent.name, showQRCodeDialog, handleShowQRCode, hasAutoShowQRTriggered]);

  const handleEdit = () => {
    // Prepare agent data for editing and navigate
    sessionStorage.setItem('editingAgent', JSON.stringify(agent));
    navigate(`/edit-agent/${agent.id}?type=${agent.type}`);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(agent.id);
      toast.success("Agente removido com sucesso!");
      setShowDeleteDialog(false);
    }
  };
  
  const handleDisconnectClick = async () => {
    try {
      const success = await handleDisconnect(agent.instanceId, agent.id);
      if (success) {
        setIsConnected(false);
        
        // Update parent state if callback provided
        if (onToggleConnection) {
          onToggleConnection(agent.id, false);
        }
      }
    } catch (error) {
      console.error("Erro ao desconectar agente:", error);
      toast.error("Erro ao desconectar agente. Tente novamente.");
    }
  };
  
  const handleConnectClick = () => {
    // Gera QR code e configura callback de conexão
    handleShowQRCode();
    // Evitar navegação para página de análise aqui
  };
  
  const handleQRConnected = () => {
    // Handle successful connection
    setIsConnected(true);
    
    // Update parent state if callback provided
    if (onToggleConnection) {
      console.log("QR code escaneado com sucesso, atualizando status de conexão do agente");
      onToggleConnection(agent.id, true);
    }
    
    // Close QR dialog
    setShowQRCodeDialog(false);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <AgentHeader 
        agent={{...agent, isConnected: isConnected}}
        onEdit={handleEdit}
        onOpenDeleteDialog={() => setShowDeleteDialog(true)}
      />
      
      <AgentContent 
        agent={agent}
        userEmail={userEmail}
      />
      
      <AgentFooter
        agent={{...agent, isConnected: isConnected}}
        onGenerateQR={handleConnectClick}
        onDisconnect={handleDisconnectClick}
        isGeneratingQR={isGeneratingQRCode}
        isDisconnecting={isDisconnecting}
        connectionCheckFailed={connectionCheckFailed}
      />
      
      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DeleteAgentDialog 
          agentName={agent.name}
          onDelete={handleDelete}
        />
      </AlertDialog>
      
      {/* QR Code Dialog */}
      <QRCodeDialog
        open={showQRCodeDialog}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseQRCode();
          }
          setShowQRCodeDialog(open);
        }}
        qrCodeImage={qrCodeImage}
        timerCount={timerCount}
        connectionCheckAttempts={connectionCheckAttempts}
        isGeneratingQRCode={isGeneratingQRCode}
        onRefresh={handleShowQRCode}
      />
    </Card>
  );
};
