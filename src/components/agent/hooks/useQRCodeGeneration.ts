
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from 'sonner';
import { useQRCodeDisplay } from "./qrcode/useQRCodeDisplay";
import { useQRCodeTimer } from "./qrcode/useQRCodeTimer";
import { useQRCodeConnection } from "./qrcode/useQRCodeConnection";

export const useQRCodeGeneration = (instanceId: string, clientIdentifier?: string) => {
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [qrGenerationAttempted, setQrGenerationAttempted] = useState(false);
  
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
  } = useQRCodeTimer((instanceId) => updateQRCode(instanceId, clientIdentifier));
  
  const {
    connectionCheckAttempts,
    connectionCheckIntervalRef,
    startConnectionStatusCheck,
    clearConnectionCheck
  } = useQRCodeConnection();

  // Clear intervals when component unmounts
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
    // Additional logic for when agent is connected
  }, [clearQRCodeTimer, clearConnectionCheck, setQrCodeImage]);

  // Function to show QR code dialog and handle QR code generation
  const handleShowQRCode = useCallback(async () => {
    if (qrGenerationAttempted && !qrCodeImage) {
      toast.error("Não foi possível gerar o QR Code. Tente novamente mais tarde.");
      return;
    }
    
    console.log("Initiating QR code generation for:", instanceId, "Client ID:", clientIdentifier);
    setShowQRCodeDialog(true);
    
    // Reset state
    if (!qrCodeImage) {
      setQrCodeImage(null);
      clearQRCodeTimer();
      clearConnectionCheck();
      
      // Get QR code
      setQrGenerationAttempted(true);
      const success = await updateQRCode(instanceId, clientIdentifier);
      
      if (success) {
        console.log("QR code generated successfully, starting timers");
        // Start timer for QR code refresh
        startQRCodeUpdateTimer(instanceId);
        
        // Start checking connection status
        startConnectionStatusCheck(instanceId, handleConnected);
      } else {
        console.error("Failed to generate QR code");
        toast.error("Erro ao gerar QR Code. Tente novamente.");
        setShowQRCodeDialog(false);
      }
    } else {
      // If we already have a QR code, just show it without regenerating
      console.log("Using existing QR code");
    }
  }, [
    instanceId,
    clientIdentifier,
    qrCodeImage,
    qrGenerationAttempted,
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
    clearQRCodeTimer();
    clearConnectionCheck();
    // Don't clear qrCodeImage immediately to avoid regeneration when reopening
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
    handleConnected
  };
};
