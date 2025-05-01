
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useQRCodeGeneration = (agentName: string, agentType: string) => {
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [timerCount, setTimerCount] = useState(30);
  const [instanceName, setInstanceName] = useState<string>("");
  const [connectionCheckAttempts, setConnectionCheckAttempts] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);
  const connectionCheckIntervalRef = useRef<number | null>(null);
  
  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
      if (connectionCheckIntervalRef.current !== null) {
        window.clearInterval(connectionCheckIntervalRef.current);
      }
    };
  }, []);
  
  const handleCloseQRDialog = () => {
    setShowQRDialog(false);
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (connectionCheckIntervalRef.current !== null) {
      window.clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
    
    // Clear stored instance ID
    sessionStorage.removeItem('currentInstanceId');
    setConnectionCheckAttempts(0);
  };
  
  const startQRCodeUpdateTimer = (instanceId: string) => {
    setTimerCount(30);
    
    // Clear any existing interval
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
    }
    
    // Set new interval
    const intervalId = window.setInterval(() => {
      setTimerCount((prevCount) => {
        if (prevCount <= 1) {
          // Update QR code
          updateQRCode(instanceId);
          return 30;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    // Store interval ID for cleanup
    timerIntervalRef.current = intervalId;
  };
  
  const updateQRCode = async (instanceName: string) => {
    try {
      console.log("Updating QR code for instance:", instanceName);
      
      const response = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/atualizar-qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update QR code');
      }
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let imgSrc;
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const base64Data = data.mensagem || data.qrCodeBase64;
        
        if (!base64Data) {
          throw new Error('Invalid response format');
        }
        
        imgSrc = `data:image/png;base64,${base64Data}`;
      } else {
        const blob = await response.blob();
        imgSrc = URL.createObjectURL(blob);
      }
      
      setQrCodeImage(imgSrc);
      toast.info("QR Code atualizado");
      
    } catch (error) {
      console.error("Error updating QR code:", error);
      toast.error("Erro ao atualizar QR Code");
    }
  };
  
  const startConnectionStatusCheck = (instanceName: string, onConnected: () => void) => {
    // Clear any existing interval
    if (connectionCheckIntervalRef.current !== null) {
      window.clearInterval(connectionCheckIntervalRef.current);
    }
    
    setConnectionCheckAttempts(0);
    
    // Start checking connection status every 5 seconds
    const intervalId = window.setInterval(async () => {
      try {
        console.log("Checking connection status for:", instanceName);
        
        const response = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/verificar-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instanceId: instanceName }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to check connection status');
        }
        
        const data = await response.json();
        console.log("Connection status response:", data);
        
        // If connected, trigger the onConnected callback
        if (data.status === 'connected' || data.isConnected === true) {
          console.log("Connection successful!");
          
          // Stop both intervals
          if (timerIntervalRef.current !== null) {
            window.clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          
          window.clearInterval(intervalId);
          connectionCheckIntervalRef.current = null;
          
          // Call connected callback
          onConnected();
        } else {
          // Increment connection check attempts
          setConnectionCheckAttempts(prev => prev + 1);
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
        setConnectionCheckAttempts(prev => prev + 1);
      }
    }, 5000); // Check every 5 seconds
    
    connectionCheckIntervalRef.current = intervalId;
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
      
      // Call webhook to generate QR code
      const response = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/criar-instancia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let imgSrc;
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const base64Data = data.mensagem || data.qrCodeBase64;
        
        if (!base64Data) {
          throw new Error('Invalid response format');
        }
        
        imgSrc = `data:image/png;base64,${base64Data}`;
      } else {
        const blob = await response.blob();
        imgSrc = URL.createObjectURL(blob);
      }
      
      setQrCodeImage(imgSrc);
      
      // Start timer for QR code updates
      startQRCodeUpdateTimer(instanceName);
      
      // Start interval for checking connection status if onConnected callback provided
      if (onConnected) {
        startConnectionStatusCheck(instanceName, onConnected);
      }
      
      toast.success("QR Code gerado com sucesso");
      
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Erro ao gerar QR Code");
      setShowQRDialog(false);
    } finally {
      setIsGeneratingQR(false);
    }
  };
  
  const handleConnected = () => {
    // Clear any existing intervals
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (connectionCheckIntervalRef.current !== null) {
      window.clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
    
    // Reset states
    setQrCodeImage(null);
    setShowQRDialog(false);
    setConnectionCheckAttempts(0);
    
    // Show success message
    toast.success("Conexão estabelecida com sucesso!");
  };

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
