
import { useState } from 'react';
import { toast } from 'sonner';
import { fetchQRCode } from '../api/qrCodeApi';

export const useQRCodeDisplay = () => {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  
  const updateQRCode = async (instanceName: string) => {
    try {
      console.log("Updating QR code for instance:", instanceName);
      
      const imgSrc = await fetchQRCode(instanceName);
      
      if (imgSrc) {
        setQrCodeImage(imgSrc);
        toast.info("QR Code atualizado");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error updating QR code:", error);
      toast.error("Erro ao atualizar QR Code");
      return false;
    }
  };

  return {
    qrCodeImage,
    setQrCodeImage,
    updateQRCode
  };
};
