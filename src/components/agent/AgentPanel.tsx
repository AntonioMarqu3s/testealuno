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
  const [isConnected, setIsConnected] = useState(agent.isConnected);
  
  // Custom hooks for QR code and connection
  const { 
    showQRCodeDialog, 
    setShowQRCodeDialog,
    qrCodeImage, 
    isGeneratingQRCode,
    timerCount,
    connectionCheckAttempts,
    handleShowQRCode,
    handleCloseQRCode,
    isConnected: isQRConnected,
    setIsConnected: setQRConnected
  } = useQRCodeGeneration(agent.instanceId, agent.clientIdentifier);
  
  const { isDisconnecting, isCheckingStatus, handleDisconnect, checkConnectionStatus } = useAgentConnection();

  // Sync the local connected state with QR code hook's connected state
  useEffect(() => {
    if (isQRConnected !== isConnected) {
      setIsConnected(isQRConnected);
      
      // Update parent state if callback provided
      if (onToggleConnection && isQRConnected !== agent.isConnected) {
        onToggleConnection(agent.id, isQRConnected);
      }
    }
  }, [isQRConnected, isConnected, agent.id, agent.isConnected, onToggleConnection]);

  // Check connection status when component mounts
  useEffect(() => {
    if (agent.instanceId) {
      const verifyStatus = async () => {
        try {
          console.log("Verifying agent connection status on mount:", agent.instanceId);
          const connected = await checkConnectionStatus(agent.instanceId);
          
          // Only update if the connection status is different
          if (connected !== isConnected) {
            setIsConnected(connected);
            setQRConnected(connected);
            
            // Update parent state if callback provided
            if (onToggleConnection) {
              onToggleConnection(agent.id, connected);
            }
          }
        } catch (error) {
          console.error("Error checking connection status:", error);
          // Don't update status on error, keep current state
        }
      };
      
      verifyStatus();
    }
  }, [agent.instanceId, checkConnectionStatus, isConnected, agent.id, onToggleConnection, setQRConnected]);

  // Handle auto show QR code when directed from agent creation
  useEffect(() => {
    if (autoShowQR && !showQRCodeDialog) {
      console.log("Auto showing QR code for agent:", agent.name);
      setTimeout(() => handleShowQRCode(), 300);
    }
  }, [autoShowQR, agent.name, showQRCodeDialog, handleShowQRCode]);

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
      const success = await handleDisconnect(agent.instanceId);
      if (success) {
        setIsConnected(false);
        setQRConnected(false);
        
        // Update parent state if callback provided
        if (onToggleConnection) {
          onToggleConnection(agent.id, false);
        }
        
        toast.success("Agente desconectado com sucesso!");
      }
    } catch (error) {
      console.error("Error disconnecting agent:", error);
      toast.error("Erro ao desconectar agente. Tente novamente.");
    }
  };
  
  const handleConnectClick = () => {
    // Gera QR code e configura callback de conexão
    handleShowQRCode();
    // Evitar navegação para página de análise aqui
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
      />
    </Card>
  );
};
