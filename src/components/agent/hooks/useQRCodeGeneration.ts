
import { useState, useEffect, useRef } from "react";
import { useQRCodeDisplay } from "./qrcode/useQRCodeDisplay";
import { useQRCodeTimer } from "./qrcode/useQRCodeTimer";
import { useQRCodeConnection } from "./qrcode/useQRCodeConnection";

export const useQRCodeGeneration = (instanceName: string) => {
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
  const handleConnected = () => {
    console.log("Agent connected successfully!");
    setShowQRCodeDialog(false);
    setQrCodeImage(null);
    clearQRCodeTimer();
    // Additional logic for when agent is connected
  };

  // Function to show QR code dialog and handle QR code generation
  const handleShowQRCode = async () => {
    setShowQRCodeDialog(true);
    
    // Reset state
    setQrCodeImage(null);
    clearQRCodeTimer();
    clearConnectionCheck();
    
    // Get QR code
    const success = await updateQRCode(instanceName);
    
    if (success) {
      // Start timer for QR code refresh
      startQRCodeUpdateTimer(instanceName);
      
      // Start checking connection status
      startConnectionStatusCheck(instanceName, handleConnected);
    }
  };

  // Function to close QR code dialog and clean up
  const handleCloseQRCode = () => {
    setShowQRCodeDialog(false);
    setQrCodeImage(null);
    clearQRCodeTimer();
    clearConnectionCheck();
  };

  return {
    showQRCodeDialog,
    setShowQRCodeDialog,
    qrCodeImage,
    isGeneratingQRCode,
    timerCount,
    connectionCheckAttempts,
    handleShowQRCode,
    handleCloseQRCode
  };
};
