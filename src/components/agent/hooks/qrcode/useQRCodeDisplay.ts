
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchQRCode } from '../api/qrCodeApi';

export const useQRCodeDisplay = () => {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isGeneratingQRCode, setIsGeneratingQRCode] = useState(false);
  
  const updateQRCode = useCallback(async (instanceName: string) => {
    try {
      setIsGeneratingQRCode(true);
      console.log("Updating QR code for instance:", instanceName);
      
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
