
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
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ agent, onDelete, onToggleConnection }) => {
  const navigate = useNavigate();
  const userEmail = getCurrentUserEmail();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(agent.isConnected);
  
  // Custom hooks for QR code and connection
  const { 
    isGeneratingQR, 
    showQRDialog, 
    qrCodeImage, 
    timerCount,
    instanceName,
    connectionCheckAttempts,
    handleGenerateQrCode, 
    setShowQRDialog,
    handleConnected 
  } = useQRCodeGeneration(agent.name, agent.type);
  
  const { isDisconnecting, isCheckingStatus, handleDisconnect, checkConnectionStatus } = useAgentConnection();

  // Check connection status when component mounts
  useEffect(() => {
    if (agent.instanceId) {
      const verifyStatus = async () => {
        const connected = await checkConnectionStatus(agent.instanceId);
        
        // Only update if the connection status is different
        if (connected !== isConnected) {
          setIsConnected(connected);
          
          // Update parent state if callback provided
          if (onToggleConnection) {
            onToggleConnection(agent.id, connected);
          }
        }
      };
      
      verifyStatus();
    }
  }, [agent.instanceId]);

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
    const success = await handleDisconnect(agent.instanceId);
    if (success) {
      setIsConnected(false);
      
      // Update parent state if callback provided
      if (onToggleConnection) {
        onToggleConnection(agent.id, false);
      }
    }
  };
  
  const handleConnectClick = () => {
    // Generate QR code and set up connection callback
    handleGenerateQrCode(handleQRConnected);
  };
  
  const handleQRConnected = () => {
    // Handle successful connection
    handleConnected();
    setIsConnected(true);
    
    // Update parent state if callback provided
    if (onToggleConnection) {
      console.log("QR code scanned successfully, updating agent connection status");
      onToggleConnection(agent.id, true);
    }
    
    // Close QR dialog
    setShowQRDialog(false);
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
        isGeneratingQR={isGeneratingQR}
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
        open={showQRDialog}
        onOpenChange={setShowQRDialog}
        qrCodeImage={qrCodeImage}
        timerCount={timerCount}
        onConnected={handleQRConnected}
        connectionCheckAttempts={connectionCheckAttempts}
      />
    </Card>
  );
};
