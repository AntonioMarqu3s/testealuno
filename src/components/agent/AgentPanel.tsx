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
import { useAgentDelete } from "@/hooks/agent/useAgentDelete";

interface AgentPanelProps {
  agent: Agent;
  onDelete?: (agentId: string) => Promise<boolean>;
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
  // Ensure agent data is properly accessed, handling both direct properties and agent_data object
  const processedAgent: Agent = {
    ...agent,
    // Add fallback for legacy agents or direct fields vs agent_data field
    personality: agent.personality || agent.agent_data?.personality,
    customPersonality: agent.customPersonality || agent.agent_data?.customPersonality,
    companyName: agent.companyName || agent.agent_data?.companyName,
    companyDescription: agent.companyDescription || agent.agent_data?.companyDescription,
    segment: agent.segment || agent.agent_data?.segment,
    mission: agent.mission || agent.agent_data?.mission,
    vision: agent.vision || agent.agent_data?.vision,
    mainDifferentials: agent.mainDifferentials || agent.agent_data?.mainDifferentials,
    competitors: agent.competitors || agent.agent_data?.competitors,
    commonObjections: agent.commonObjections || agent.agent_data?.commonObjections,
    productName: agent.productName || agent.agent_data?.productName,
    productDescription: agent.productDescription || agent.agent_data?.productDescription,
    problemsSolved: agent.problemsSolved || agent.agent_data?.problemsSolved,
    benefits: agent.benefits || agent.agent_data?.benefits,
    differentials: agent.differentials || agent.agent_data?.differentials
  };

  const navigate = useNavigate();
  const userEmail = getCurrentUserEmail();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(processedAgent.isConnected || processedAgent.connectInstancia || false);
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
  } = useQRCodeGeneration(processedAgent.instanceId, processedAgent.clientIdentifier);
  
  const { isDisconnecting, isCheckingStatus, handleDisconnect } = useAgentConnection();
  const { handleDeleteAgent: defaultDeleteHandler } = useAgentDelete();

  // Keep local deleting state in sync with prop
  useEffect(() => {
    setLocalIsDeleting(isDeleting);
  }, [isDeleting]);

  // Handle auto show QR code when directed from agent creation - only trigger once
  useEffect(() => {
    if (autoShowQR && !showQRCodeDialog && !hasAutoShowQRTriggered) {
      console.log("Auto showing QR code for agent:", processedAgent.name);
      setHasAutoShowQRTriggered(true);
      setTimeout(() => handleShowQRCode(), 300);
    }
  }, [autoShowQR, processedAgent.name, showQRCodeDialog, handleShowQRCode, hasAutoShowQRTriggered]);

  const handleEdit = () => {
    // Prepare agent data for editing and navigate
    sessionStorage.setItem('editingAgent', JSON.stringify(processedAgent));
    navigate(`/edit-agent/${processedAgent.id}?type=${processedAgent.type}`);
  };

  const confirmDelete = async () => {
    setLocalIsDeleting(true);
    try {
      let success = false;
      
      if (onDelete) {
        success = await onDelete(processedAgent.id);
      } else {
        success = await defaultDeleteHandler(processedAgent.id);
      }
      
      if (success) {
        toast.success("Agente excluído com sucesso");
      } else {
        toast.error("Erro ao excluir agente");
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
      const success = await handleDisconnect(processedAgent.instanceId, processedAgent.id);
      if (success) {
        setIsConnected(false);
        
        // Update parent state if callback provided
        if (onToggleConnection) {
          onToggleConnection(processedAgent.id, false);
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
  };
  
  const handleQRConnected = () => {
    // Handle successful connection
    setIsConnected(true);
    
    // Update parent state if callback provided
    if (onToggleConnection) {
      console.log("QR code scanned successfully, updating agent connection status");
      onToggleConnection(processedAgent.id, true);
    }
    
    // Close QR dialog
    setShowQRCodeDialog(false);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <AgentHeader 
        agent={{...processedAgent, isConnected: isConnected}}
        onEdit={handleEdit}
        onOpenDeleteDialog={() => setShowDeleteDialog(true)}
      />
      
      <AgentContent 
        agent={processedAgent}
        userEmail={userEmail}
      />
      
      <AgentFooter
        agent={{...processedAgent, isConnected: isConnected}}
        onGenerateQR={handleConnectClick}
        onDisconnect={handleDisconnectClick}
        isGeneratingQR={isGeneratingQRCode}
        isDisconnecting={isDisconnecting}
      />
      
      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DeleteAgentDialog 
          agentName={processedAgent.name}
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
