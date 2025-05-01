
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from 'sonner';
import { useQRCodeDisplay } from "./qrcode/useQRCodeDisplay";
import { useQRCodeTimer } from "./qrcode/useQRCodeTimer";
import { useQRCodeConnection } from "./qrcode/useQRCodeConnection";

export const useQRCodeGeneration = (instanceId: string) => {
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
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
  } = useQRCodeTimer(updateQRCode);
  
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
    toast.success("Agente conectado com sucesso!");
    setShowQRCodeDialog(false);
    setQrCodeImage(null);
    clearQRCodeTimer();
    clearConnectionCheck();
    // Additional logic for when agent is connected
  }, [clearQRCodeTimer, clearConnectionCheck, setQrCodeImage]);

  // Function to show QR code dialog and handle QR code generation
  const handleShowQRCode = useCallback(async () => {
    console.log("Initiating QR code generation for:", instanceId);
    setShowQRCodeDialog(true);
    
    // Reset state
    setQrCodeImage(null);
    clearQRCodeTimer();
    clearConnectionCheck();
    
    // Get QR code
    const success = await updateQRCode(instanceId);
    
    if (success) {
      console.log("QR code generated successfully, starting timers");
      // Start timer for QR code refresh
      startQRCodeUpdateTimer(instanceId);
      
      // Start checking connection status
      startConnectionStatusCheck(instanceId, handleConnected);
    } else {
      console.error("Failed to generate QR code");
      toast.error("Erro ao gerar QR Code. Tente novamente.");
    }
  }, [
    instanceId, 
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
    setQrCodeImage(null);
    clearQRCodeTimer();
    clearConnectionCheck();
  }, [clearQRCodeTimer, clearConnectionCheck, setQrCodeImage]);

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
