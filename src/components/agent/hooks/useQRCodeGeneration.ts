
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useQRCodeGeneration = (agentName: string, agentType: string) => {
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [timerCount, setTimerCount] = useState(30);
  const [instanceName, setInstanceName] = useState<string>("");
  const timerIntervalRef = useRef<number | null>(null);
  
  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, []);
  
  const handleCloseQRDialog = () => {
    setShowQRDialog(false);
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };
  
  const startQRCodeUpdateTimer = (instanceName: string) => {
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
          updateQRCode(instanceName);
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
  
  const handleGenerateQrCode = async () => {
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
      const instanceName = `${agentTypeMap[agentType] || agentType} - ${agentName}`;
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
    // Clear any existing interval
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Clear stored instance ID
    sessionStorage.removeItem('currentInstanceId');
    
    // Reset states
    setQrCodeImage(null);
    setShowQRDialog(false);
  };

  return {
    isGeneratingQR,
    showQRDialog,
    qrCodeImage,
    timerCount,
    instanceName,
    handleGenerateQrCode,
    setShowQRDialog: handleCloseQRDialog,
    handleConnected
  };
};
