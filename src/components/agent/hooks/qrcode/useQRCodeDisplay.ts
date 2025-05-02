
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createAgentInstance } from '../api/agentConnectionApi';
import { fetchQRCode } from '../api/qrCodeApi';

export const useQRCodeDisplay = () => {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isGeneratingQRCode, setIsGeneratingQRCode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [qrCodeCache, setQrCodeCache] = useState<Record<string, { imgSrc: string, timestamp: number }>>({});
  const MAX_RETRIES = 1;
  const CACHE_EXPIRY = 120000; // 2 minutes cache expiry
  
  const updateQRCode = useCallback(async (instanceName: string, clientIdentifier?: string) => {
    if (!instanceName) {
      console.error("No instance name provided");
      toast.error("Nome da instância não fornecido");
      return false;
    }
    
    try {
      setIsGeneratingQRCode(true);
      
      // Check cache first
      const now = Date.now();
      const cachedQR = qrCodeCache[instanceName];
      if (cachedQR && (now - cachedQR.timestamp) < CACHE_EXPIRY) {
        console.log("Using cached QR code, age:", (now - cachedQR.timestamp) / 1000, "seconds");
        setQrCodeImage(cachedQR.imgSrc);
        toast.success("QR Code carregado");
        setIsGeneratingQRCode(false);
        setRetryCount(0);
        return true;
      }
      
      console.log("Updating QR code for instance:", instanceName, "Client identifier:", clientIdentifier);
      
      // Create the instance first
      const instanceCreated = await createAgentInstance(instanceName, clientIdentifier);
      if (!instanceCreated) {
        console.warn("Failed to create instance, but still trying to fetch QR code");
        // Continue to attempt fetching QR code even if instance creation fails
      } else {
        console.log("Instance created successfully");
      }
      
      // Add a small delay to ensure backend processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Now get the QR code
      try {
        const imgSrc = await fetchQRCode(instanceName);
        
        if (imgSrc) {
          console.log("QR code updated successfully, length:", imgSrc.length);
          
          // Cache the QR code
          setQrCodeCache(prev => ({
            ...prev,
            [instanceName]: { imgSrc, timestamp: Date.now() }
          }));
          
          setQrCodeImage(imgSrc);
          toast.success("QR Code gerado com sucesso");
          setRetryCount(0);
          setIsGeneratingQRCode(false);
          return true;
        } else {
          console.error("QR code update failed: No image returned");
          
          // Only retry once
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying QR code fetch, attempt ${retryCount + 1}`);
            setRetryCount(prev => prev + 1);
            // Try again after a delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsGeneratingQRCode(false);
            return updateQRCode(instanceName, clientIdentifier);
          }
          
          toast.error("Erro ao atualizar QR Code: Nenhuma imagem retornada");
          setRetryCount(0);
          setIsGeneratingQRCode(false);
          
          // In development, use a placeholder for testing
          if (process.env.NODE_ENV === 'development') {
            const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOdSURBVO3BQY4cOxIEwfAC//9l7x3jrYBBJNWjmRH2B2utP1hj3WCNdYM11g3WWDdYY91gjXWDNdYN1lg3WGPdYI11gzXWDdZYN1hj3WCN9YeXJPxJlW8kcJKqk4QnVZ0kfEPVScI3VJ0k/EmVb6yxbrDGusEa6wZf+LJKJ5W+odJJwkmlaYQTlU4qnVQ6SZhGOEnopNI3VPqmSt9U6ZvWWDdYY91gjXWDH/lhEk4qnSR0Ek5UTiqdJJyonFQ6SThROVF5UqWThBOVJwl/0hrrBmusG6yxbvAjf5mEE5WThBOVTsJJwknlROUk4UTlGwl/szXWDdZYN1hj3eArf7mEk4SThE6lk4SThBOVE5WThBOVTsKT1lg3WGPdYI11g6/8J1U6SThJOEk4SThJOKmYVDpRmRKeWmPdYI11gzXWDb7yn1TpJOEk4YlKJwknKicJJwmdSicJJwmdypPK32yNdYM11g3WWDf4wpclTCp9Q6WThCdVOkk4STipeKLSSUIn4YlK31TpJOEba6wbrLFusMa6wR9eSphUOkl4knCi8kSlk4QnlU4STlSeJDxR6SRhUukk4U9aY91gjXWDNdYNfuRFCZ1KJwmdSicJJwmdSicJnconCSrfUOmTEk5UOkn4xhrrBmusG6yxbvCHP0ylk4QnCSrfSOhU6iR0Ck9UThI6lScJJwknKk9aY91gjXWDNdYNfuRFCX9SpZOEJyqdJJwkPFHpJGFS6VsqnSScJExV+qY11g3WWDdYY93gCy+q9KRKJwknCScqnSR8otJJwonKpNJJwqTSScKTKn1DpZOEb6yxbrDGusEa6wY/8sNUnqh0knCi8g0JJwknCZNKJwknCU+qdJLwJOFJlX7SGusGa6wbrLFu8JW/XEKn8qRKJwlPEk5UnlQ6SThReaLSScKTKp2odJLwpDXWDdZYN1hj3eBHflilk4QTlU4SJpWeSJhUmhL+JpVOVDpJeNIa6wZrrBussbXlxUoqnSR8U8KJyknCNyV0Kp0kdAmdypOEE5Vvmk80rLFusMa6wRrrBl95UcKk0knCicqJyqTSk4QnKp0kTCqdJJyonKicJEwqnSR8otJJwjfWWDdYY91gjXWDH/mQSicJJwmdyknCpNJJwqRyktCpTCqdJEwqnSR0Kp2EE5VJ5ZPWWDdYY91gjXWDH/mXSXii0knCScKTKp0kTAmdSicJk0onCSdVOkl4knCi8qQ11g3WWDdYY93gD9Za/rDGusEa6wZrrBussbXlL22nNrxM003hAAAAAElFTkSuQmCC";
            console.log("Using placeholder QR code for development");
            setQrCodeImage(placeholder);
            return true;
          }
          
          return false;
        }
      } catch (qrError) {
        console.error("Error fetching QR code:", qrError);
        
        // Only retry once
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying QR code fetch, attempt ${retryCount + 1}`);
          setRetryCount(prev => prev + 1);
          // Try again with slight delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          setIsGeneratingQRCode(false);
          return updateQRCode(instanceName, clientIdentifier);
        }
        
        toast.error("Erro ao gerar QR Code");
        setRetryCount(0);
        setIsGeneratingQRCode(false);
        
        // In development, use a placeholder for testing
        if (process.env.NODE_ENV === 'development') {
          const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOdSURBVO3BQY4cOxIEwfAC//9l7x3jrYBBJNWjmRH2B2utP1hj3WCNdYM11g3WWDdYY91gjXWDNdYN1lg3WGPdYI11gzXWDdZYN1hj3WCN9YeXJPxJlW8kcJKqk4QnVZ0kfEPVScI3VJ0k/EmVb6yxbrDGusEa6wZf+LJKJ5W+odJJwkmlaYQTlU4qnVQ6SZhGOEnopNI3VPqmSt9U6ZvWWDdYY91gjXWDH/lhEk4qnSR0Ek5UTiqdJJyonFQ6SThROVF5UqWThBOVJwl/0hrrBmusG6yxbvAjf5mEE5WThBOVTsJJwknlROUk4UTlGwl/szXWDdZYN1hj3eArf7mEk4SThE6lk4SThBOVE5WThBOVTsKT1lg3WGPdYI11g6/8J1U6SThJOEk4SThJOKmYVDpRmRKeWmPdYI11gzXWDb7yn1TpJOEk4YlKJwknKicJJwmdSicJJwmdypPK32yNdYM11g3WWDf4wpclTCp9Q6WThCdVOkk4STipeKLSSUIn4YlK31TpJOEba6wbrLFusMa6wR9eSphUOkl4knCi8kSlk4QnlU4STlSeJDxR6SRhUukk4U9aY91gjXWDNdYNfuRFCZ1KJwmdSicJJwmdSicJnconCSrfUOmTEk5UOkn4xhrrBmusG6yxbvCHP0ylk4QnCSrfSOhU6iR0Ck9UThI6lScJJwknKk9aY91gjXWDNdYNfuRFCX9SpZOEJyqdJJwkPFHpJGFS6VsqnSScJExV+qY11g3WWDdYY93gCy+q9KRKJwknCScqnSR8otJJwonKpNJJwqTSScKTKn1DpZOEb6yxbrDGusEa6wY/8sNUnqh0knCi8g0JJwknCZNKJwknCU+qdJLwJOFJlX7SGusGa6wbrLFu8JW/XEKn8qRKJwlPEk5UnlQ6SThReaLSScKTKp2odJLwpDXWDdZYN1hj3eBHflilk4QTlU4SJpWeSJhUmhL+JpVOVDpJeNIa6wZrrBussbXlxUoqnSR8U8KJyknCNyV0Kp0kdAmdypOEE5Vvmk80rLFusMa6wRrrBl95UcKk0knCicqJyqTSk4QnKp0kTCqdJJyonKicJEwqnSR8otJJwjfWWDdYY91gjXWDH/mQSicJJwmdyknCpNJJwqRyktCpTCqdJEwqnSR0Kp2EE5VJ5ZPWWDdYY91gjXWDH/mXSXii0knCScKTKp0kTAmdSicJk0onCSdVOkl4knCi8qQ11g3WWDdYY93gD9Za/rDGusEa6wZrrBussbXlL22nNrxM003hAAAAAElFTkSuQmCC";
          console.log("Using placeholder QR code for development");
          setQrCodeImage(placeholder);
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error("Error updating QR code:", error);
      
      // Only retry once
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying QR code fetch, attempt ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        // Try again with slight delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsGeneratingQRCode(false);
        return updateQRCode(instanceName, clientIdentifier);
      }
      
      toast.error("Erro ao atualizar QR Code");
      setRetryCount(0);
      setIsGeneratingQRCode(false);
      return false;
    }
  }, [retryCount, MAX_RETRIES, qrCodeCache]);

  return {
    qrCodeImage,
    setQrCodeImage,
    isGeneratingQRCode,
    updateQRCode
  };
};
