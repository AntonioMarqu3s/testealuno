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
import { useAgentSubmission } from "@/hooks/useAgentSubmission";

interface AgentPanelProps {
  agent: Agent;
  onDelete?: (agentId: string) => void;
  onToggleConnection?: (agentId: string, isConnected: boolean) => void;
  autoShowQR?: boolean;
  isDeleting?: boolean;
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ 
  agent, 
  onDelete, 
  onToggleConnection,
  autoShowQR = false,
  isDeleting = false
}) => {
  const navigate = useNavigate();
  const userEmail = getCurrentUserEmail();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(agent.isConnected || agent.connectInstancia || false);
  const [localIsDeleting, setLocalIsDeleting] = useState(false);
  const [hasAutoShowQRTriggered, setHasAutoShowQRTriggered] = useState(false);
  
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
  const { handleDeleteAgent } = useAgentSubmission(agent.type || "");

  // Keep local deleting state in sync with prop
  useEffect(() => {
    setLocalIsDeleting(isDeleting);
  }, [isDeleting]);

  // Check connection status when component mounts
  useEffect(() => {
    if (agent.instanceId) {
      const verifyStatus = async () => {
        try {
          console.log("Verifying agent connection status on mount:", agent.instanceId);
          const connected = await checkConnectionStatus(agent.instanceId, agent.id);
          
          // Only update if the connection status is different
          if (connected !== isConnected) {
            setIsConnected(connected);
            
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
  }, [agent.instanceId, agent.id, checkConnectionStatus, isConnected, onToggleConnection]);

  // Handle auto show QR code when directed from agent creation - only trigger once
  useEffect(() => {
    if (autoShowQR && !showQRCodeDialog && !hasAutoShowQRTriggered) {
      console.log("Auto showing QR code for agent:", agent.name);
      setHasAutoShowQRTriggered(true);
      setTimeout(() => handleShowQRCode(), 300);
    }
  }, [autoShowQR, agent.name, showQRCodeDialog, handleShowQRCode, hasAutoShowQRTriggered]);

  const handleEdit = () => {
    // Prepare agent data for editing and navigate
    sessionStorage.setItem('editingAgent', JSON.stringify(agent));
    navigate(`/edit-agent/${agent.id}?type=${agent.type}`);
  };

  const confirmDelete = async () => {
    setLocalIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(agent.id);
      } else {
        await handleDeleteAgent(agent.id);
      }
    } catch (error) {
      console.error("Error during agent deletion:", error);
      toast.error("Erro ao excluir o agente", {
        description: "Ocorreu um erro inesperado ao excluir o agente. Tente novamente.",
      });
    } finally {
      setShowDeleteDialog(false);
      setLocalIsDeleting(false);
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
      console.error("Error disconnecting agent:", error);
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
      console.log("QR code scanned successfully, updating agent connection status");
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
      />
      
      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DeleteAgentDialog 
          agentName={agent.name}
          onDelete={confirmDelete}
          isDeleting={localIsDeleting}
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
