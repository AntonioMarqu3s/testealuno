
import { useState, useRef } from 'react';
import { useQRCodeTimer } from './qrcode/useQRCodeTimer';
import { useQRCodeDisplay } from './qrcode/useQRCodeDisplay';
import { useQRCodeConnection } from './qrcode/useQRCodeConnection';

export const useQRCodeGeneration = (agentName: string, agentType: string) => {
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [instanceName, setInstanceName] = useState<string>("");
  
  // Reference to store if component is mounted
  const isMountedRef = useRef(true);
  
  // Import QR code display functionality
  const { 
    qrCodeImage, 
    setQrCodeImage, 
    updateQRCode 
  } = useQRCodeDisplay();
  
  // Import timer functionality
  const { 
    timerCount, 
    timerIntervalRef,
    startQRCodeUpdateTimer, 
    clearQRCodeTimer 
  } = useQRCodeTimer(updateQRCode);
  
  // Import connection check functionality
  const {
    connectionCheckAttempts,
    connectionCheckIntervalRef,
    startConnectionStatusCheck,
    clearConnectionCheck
  } = useQRCodeConnection();
  
  const handleCloseQRDialog = () => {
    setShowQRDialog(false);
    
    // Clear timers and intervals
    clearQRCodeTimer();
    clearConnectionCheck();
    
    // Clear stored instance ID
    sessionStorage.removeItem('currentInstanceId');
  };
  
  const handleGenerateQrCode = async (onConnected?: () => void) => {
    setIsGeneratingQR(true);
    setShowQRDialog(true);
    
    try {
      // Create instance name in the format expected by the webhook
      const agentTypeMap: Record<string, string> = {
        "sales": "Vendedor",
        "sdr": "SDR",
        "closer": "Closer",
        "support": "Atendimento",
        "custom": "Personalizado",
      };
      const formattedAgentType = agentTypeMap[agentType] || agentType;
      const instanceName = `${formattedAgentType} - ${agentName}`;
      setInstanceName(instanceName);
      
      // Store instance name for status checks
      sessionStorage.setItem('currentInstanceId', instanceName);
      
      console.log("Generating QR code for instance:", instanceName);
      
      // Create instance and get initial QR code
      const success = await createInstance(instanceName);
      
      if (success) {
        // Start timer for QR code updates
        startQRCodeUpdateTimer(instanceName);
        
        // Start interval for checking connection status if onConnected callback provided
        if (onConnected && isMountedRef.current) {
          startConnectionStatusCheck(instanceName, onConnected);
        }
      }
      
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Erro ao gerar QR Code");
      setShowQRDialog(false);
    } finally {
      setIsGeneratingQR(false);
    }
  };
  
  // Imported from qrCodeApi.ts
  const createInstance = async (instanceName: string) => {
    try {
      // Call the API to create instance
      const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/criar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      
      const data = await response.json();
      console.log("Create instance response:", data);
      
      // Check if the response contains success status
      if (data.status === 'sucess' || data.status === 'success') {
        toast.success(data.mensagem || "QR Code gerado com sucesso");
        
        // Get the initial QR code
        const qrSuccess = await updateQRCode(instanceName);
        return qrSuccess;
      } else {
        throw new Error(data.mensagem || 'Erro ao gerar QR Code');
      }
    } catch (error) {
      console.error("Error creating instance:", error);
      toast.error("Erro ao criar instância");
      return false;
    }
  };
  
  const handleConnected = () => {
    // Clear any existing intervals
    clearQRCodeTimer();
    clearConnectionCheck();
    
    // Reset states
    setQrCodeImage(null);
    setShowQRDialog(false);
    
    // Show success message
    toast.success("Conexão estabelecida com sucesso!");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearQRCodeTimer();
      clearConnectionCheck();
    };
  }, []);

  return {
    isGeneratingQR,
    showQRDialog,
    qrCodeImage,
    timerCount,
    instanceName,
    connectionCheckAttempts,
    handleGenerateQrCode,
    setShowQRDialog: handleCloseQRDialog,
    handleConnected
  };
};

// Add missing imports
import { toast } from 'sonner';
import { useEffect } from 'react';
