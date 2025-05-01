
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchQRCode, createAgentInstance } from '../api/agentConnectionApi';

export const useQRCodeDisplay = () => {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isGeneratingQRCode, setIsGeneratingQRCode] = useState(false);
  
  const updateQRCode = useCallback(async (instanceName: string, clientIdentifier?: string) => {
    try {
      setIsGeneratingQRCode(true);
      console.log("Updating QR code for instance:", instanceName);
      
      // Primeiro, criamos a instância
      const instanceCreated = await createAgentInstance(instanceName, clientIdentifier);
      if (!instanceCreated) {
        console.error("Failed to create instance");
        toast.error("Erro ao criar instância do agente");
        setIsGeneratingQRCode(false);
        return false;
      }
      
      console.log("Instance created successfully, fetching QR code");
      
      // Aguarde um momento para garantir que o backend tenha tempo de processar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Agora obtenha o QR code
      const imgSrc = await fetchQRCode(instanceName);
      
      if (imgSrc) {
        console.log("QR code updated successfully");
        setQrCodeImage(imgSrc);
        toast.info("QR Code atualizado");
        return true;
      } else {
        console.error("QR code update failed: No image returned");
        toast.error("Erro ao atualizar QR Code: Nenhuma imagem retornada");
        return false;
      }
    } catch (error) {
      console.error("Error updating QR code:", error);
      toast.error("Erro ao atualizar QR Code");
      return false;
    } finally {
      setIsGeneratingQRCode(false);
    }
  }, []);

  return {
    qrCodeImage,
    setQrCodeImage,
    isGeneratingQRCode,
    updateQRCode
  };
};
