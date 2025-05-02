
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from 'sonner';
import { useQRCodeDisplay } from "./qrcode/useQRCodeDisplay";
import { useQRCodeTimer } from "./qrcode/useQRCodeTimer";
import { useQRCodeConnection } from "./qrcode/useQRCodeConnection";

export const useQRCodeGeneration = (instanceId: string, clientIdentifier?: string) => {
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [qrGenerationAttempted, setQrGenerationAttempted] = useState(false);
  const [isDialogClosedByUser, setIsDialogClosedByUser] = useState(false);
  const [instanceReady, setInstanceReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const { 
    qrCodeImage, 
    setQrCodeImage, 
    isGeneratingQRCode,
    updateQRCode 
  } = useQRCodeDisplay();
  
  const { 
    timerCount, 
    timerIntervalRef,
    startQRCodeUpdateTimer,
    clearQRCodeTimer 
  } = useQRCodeTimer((instanceId) => refreshQRCode(instanceId, clientIdentifier));
  
  const {
    connectionCheckAttempts,
    connectionCheckIntervalRef,
    startConnectionStatusCheck,
    clearConnectionCheck
  } = useQRCodeConnection();

  // Clean up intervals when component unmounts
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
      if (connectionCheckIntervalRef.current !== null) {
        window.clearInterval(connectionCheckIntervalRef.current);
      }
    };
  }, [timerIntervalRef, connectionCheckIntervalRef]);

  // Function to handle successful connection
  const handleConnected = useCallback(() => {
    console.log("Agent connected successfully!");
    setShowQRCodeDialog(false);
    setQrCodeImage(null);
    clearQRCodeTimer();
    clearConnectionCheck();
    setIsDialogClosedByUser(false);
    setInstanceReady(true);
    setIsConnected(true); // Update connected state
    // Additional logic for when agent is connected
  }, [clearQRCodeTimer, clearConnectionCheck, setQrCodeImage]);

  // Function to refresh QR code without closing the dialog
  const refreshQRCode = useCallback(async (instanceId: string, clientId?: string) => {
    console.log("Refreshing QR code for instance:", instanceId);
    if (isGeneratingQRCode) {
      console.log("QR code generation already in progress, skipping refresh");
      return false;
    }
    
    const success = await updateQRCode(instanceId, clientId);
    
    if (success) {
      console.log("QR code refreshed successfully");
      startQRCodeUpdateTimer(instanceId);
    } else {
      console.error("Failed to refresh QR code");
      toast.error("Erro ao atualizar QR Code. Tentando novamente em breve.");
    }
    
    return success;
  }, [isGeneratingQRCode, updateQRCode, startQRCodeUpdateTimer]);
  
  // Exposed method for manual refresh from UI
  const handleRefreshQRCode = useCallback(() => {
    if (!instanceId) {
      console.error("No instance ID available for refresh");
      return false;
    }
    
    clearQRCodeTimer();
    return refreshQRCode(instanceId, clientIdentifier);
  }, [instanceId, clientIdentifier, refreshQRCode, clearQRCodeTimer]);

  // Function to show QR code dialog and handle QR code generation
  const handleShowQRCode = useCallback(async () => {
    // Reset state
    setIsDialogClosedByUser(false);
    setInstanceReady(false);
    
    // If we've already tried and failed to generate a QR code and haven't closed the dialog manually
    if (qrGenerationAttempted && !qrCodeImage && !isDialogClosedByUser) {
      toast.error("Não foi possível gerar o QR Code. Tente novamente mais tarde.");
      return;
    }
    
    console.log("Initiating QR code generation for:", instanceId, "Client ID:", clientIdentifier);
    setShowQRCodeDialog(true);
    
    // Always clean up previous state when showing the dialog
    clearQRCodeTimer();
    clearConnectionCheck();
    
    // If we don't already have a QR code image, generate one
    if (!qrCodeImage) {
      setQrCodeImage(null);
      
      // Get QR code
      setQrGenerationAttempted(true);
      console.log("Calling updateQRCode for:", instanceId);
      const success = await updateQRCode(instanceId, clientIdentifier);
      
      if (success) {
        console.log("QR code generated successfully, starting timers");
        // Start timer for QR code refresh
        startQRCodeUpdateTimer(instanceId);
        
        // Add small delay before checking connection
        setTimeout(() => {
          // Start checking connection status
          if (!isDialogClosedByUser) {
            console.log("Starting connection status checks");
            startConnectionStatusCheck(instanceId, handleConnected);
          }
        }, 2000);
        
      } else {
        console.error("Failed to generate QR code");
        toast.error("Erro ao gerar QR Code. Tente novamente.");
        setShowQRCodeDialog(false);
      }
    } else {
      // If we already have a QR code, just show it without regenerating
      console.log("Using existing QR code");
      // Start timer for QR code refresh
      startQRCodeUpdateTimer(instanceId);
      
      // Start checking connection status
      startConnectionStatusCheck(instanceId, handleConnected);
    }
    
  }, [
    instanceId,
    clientIdentifier,
    qrCodeImage,
    qrGenerationAttempted,
    isDialogClosedByUser,
    setQrCodeImage, 
    clearQRCodeTimer, 
    clearConnectionCheck, 
    updateQRCode, 
    startQRCodeUpdateTimer, 
    startConnectionStatusCheck, 
    handleConnected
  ]);

  // Function to close QR code dialog and clean up
  const handleCloseQRCode = useCallback(() => {
    setShowQRCodeDialog(false);
    setIsDialogClosedByUser(true);
    clearQRCodeTimer();
    clearConnectionCheck();
    // Don't clear qrCodeImage immediately to avoid regeneration when reopening quickly
  }, [clearQRCodeTimer, clearConnectionCheck]);

  return {
    showQRCodeDialog,
    setShowQRCodeDialog,
    qrCodeImage,
    isGeneratingQRCode,
    timerCount,
    connectionCheckAttempts,
    handleShowQRCode,
    handleCloseQRCode,
    handleRefreshQRCode,
    instanceReady,
    isConnected, // Expose connection status
    setIsConnected // Expose method to update connection status
  };
};
