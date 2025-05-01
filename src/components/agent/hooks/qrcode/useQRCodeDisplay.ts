
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createAgentInstance } from '../api/agentConnectionApi';
import { fetchQRCode } from '../api/qrCodeApi';

export const useQRCodeDisplay = () => {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isGeneratingQRCode, setIsGeneratingQRCode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  
  const updateQRCode = useCallback(async (instanceName: string, clientIdentifier?: string) => {
    try {
      setIsGeneratingQRCode(true);
      setQrCodeImage(null); // Clear any existing QR code
      console.log("Updating QR code for instance:", instanceName, "Client identifier:", clientIdentifier);
      
      // Create the instance first
      const instanceCreated = await createAgentInstance(instanceName, clientIdentifier);
      if (!instanceCreated) {
        console.error("Failed to create instance");
        toast.error("Erro ao criar instância do agente");
        setIsGeneratingQRCode(false);
        return false;
      }
      
      console.log("Instance created successfully, fetching QR code");
      
      // Wait a moment to ensure the backend has time to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Now get the QR code
      try {
        const imgSrc = await fetchQRCode(instanceName);
        
        if (imgSrc) {
          console.log("QR code updated successfully, length:", imgSrc.length);
          console.log("QR code data starts with:", imgSrc.substring(0, 50) + "...");
          
          // Validate image data before setting it
          const isValidBase64 = /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/=]+$/.test(imgSrc);
          const isBlobUrl = imgSrc.startsWith('blob:');
          
          if (!isValidBase64 && !isBlobUrl) {
            console.log("QR code data may not be valid, attempting to fix format");
            
            // Try to fix common issues with data format
            const fixedImgSrc = imgSrc.trim();
            
            // Create a proper base64 image URL if needed
            if (!fixedImgSrc.startsWith('data:image') && !fixedImgSrc.startsWith('blob:')) {
              // Check if it looks like base64
              const base64Pattern = /^[A-Za-z0-9+/=]+$/;
              if (base64Pattern.test(fixedImgSrc)) {
                console.log("String looks like raw base64, adding data:image prefix");
                const formattedData = `data:image/png;base64,${fixedImgSrc}`;
                setQrCodeImage(formattedData);
                toast.success("QR Code atualizado");
                setIsGeneratingQRCode(false);
                return true;
              }
            }
          }
          
          // Test image loading before setting it
          const testImg = new Image();
          let imageLoadTimeoutId: number;
          
          testImg.onload = () => {
            console.log("QR code image loaded successfully");
            clearTimeout(imageLoadTimeoutId);
            setQrCodeImage(imgSrc);
            toast.success("QR Code atualizado");
            setRetryCount(0); // Reset retry count on success
            setIsGeneratingQRCode(false);
          };
          
          testImg.onerror = () => {
            console.error("QR code image failed to load");
            clearTimeout(imageLoadTimeoutId);
            
            // Retry logic
            if (retryCount < MAX_RETRIES) {
              console.log(`Retrying QR code fetch attempt ${retryCount + 1} of ${MAX_RETRIES}`);
              setRetryCount(prev => prev + 1);
              // Try again but with slight delay
              setTimeout(() => updateQRCode(instanceName, clientIdentifier), 2000);
              return;
            }
            
            toast.error("Erro ao carregar QR Code");
            setRetryCount(0);
            
            // Use placeholder in development
            if (process.env.NODE_ENV === 'development') {
              const placeholder = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOdSURBVO3BQY4cOxIEwfAC//9l7x3jrYBBJNWjmRH2B2utP1hj3WCNdYM11g3WWDdYY91gjXWDNdYN1lg3WGPdYI11gzXWDdZYN1hj3WCN9YeXJPxJlW8kcJKqk4QnVZ0kfEPVScI3VJ0k/EmVb6yxbrDGusEa6wZf+LJKJ5W+odJJwkmlaYQTlU4qnVQ6SZhGOEnopNI3VPqmSt9U6ZvWWDdYY91gjXWDH/lhEk4qnSR0Ek5UTiqdJJyonFQ6SThROVF5UqWThBOVJwl/0hrrBmusG6yxbvAjf5mEE5WThBOVTsJJwknlROUk4UTlGwl/szXWDdZYN1hj3eArf7mEk4SThE6lk4SThBOVE5WThBOVTsKT1lg3WGPdYI11g6/8J1U6SThJOEk4SThJOKmYVDpRmRKeWmPdYI11gzXWDb7yn1TpJOEk4YlKJwknKicJJwmdSicJJwmdypPK32yNdYM11g3WWDf4wpclTCp9Q6WThCdVOkk4STipeKLSSUIn4YlK31TpJOEba6wbrLFusMa6wR9eSphUOkl4knCi8kSlk4QnlU4STlSeJDxR6SRhUukk4U9aY91gjXWDNdYNfuRFCZ1KJwmdSicJJwmdSicJnconCSrfUOmTEk5UOkn4xhrrBmusG6yxbvCHP0ylk4QnCSrfSOhU6iR0Ck9UThI6lScJJwknKk9aY91gjXWDNdYNfuRFCX9SpZOEJyqdJJwkPFHpJGFS6VsqnSScJExV+qY11g3WWDdYY93gCy+q9KRKJwknCScqnSR8otJJwonKpNJJwqTSScKTKn1DpZOEb6yxbrDGusEa6wY/8sNUnqh0knCi8g0JJwknCZNKJwknCU+qdJLwJOFJlX7SGusGa6wbrLFu8JW/XEKn8qRKJwlPEk5UnlQ6SThReaLSScKTKp2odJLwpDXWDdZYN1hj3eBHflilk4QTlU4SJpWeSJhUmhL+JpVOVDpJeNIa6wZrrBussbXlxUoqnSR8U8KJyknCNyV0Kp0kdAmdypOEE5Vvmk80rLFusMa6wRrrBl95UcKk0knCicqJyqTSk4QnKp0kTCqdJJyonKicJEwqnSR8otJJwjfWWDdYY91gjXWDH/mQSicJJwmdyknCpNJJwqRyktCpTCqdJEwqnSR0Kp2EE5VJ5ZPWWDdYY91gjXWDH/mXSXii0knCScKTKp0kTAmdSicJk0onCSdVOkl4knCi8qQ11g3WWDdYY93gD9Za/rDGusEa6wZrrBussbXlL22nNrxM003hAAAAAElFTkSuQmCC";
              console.log("Using placeholder QR code for development");
              setQrCodeImage(placeholder);
              setIsGeneratingQRCode(false);
            } else {
              setIsGeneratingQRCode(false);
            }
          };
          
          // Set timeout in case onload/onerror don't fire
          imageLoadTimeoutId = window.setTimeout(() => {
            console.log("QR code image load timed out, setting it anyway");
            setQrCodeImage(imgSrc);
            setIsGeneratingQRCode(false);
          }, 5000);
          
          testImg.src = imgSrc;
          return true;
        } else {
          console.error("QR code update failed: No image returned");
          toast.error("Erro ao atualizar QR Code: Nenhuma imagem retornada");
          setIsGeneratingQRCode(false);
          return false;
        }
      } catch (qrError) {
        console.error("Error fetching QR code:", qrError);
        toast.error("Erro ao gerar QR Code");
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
      toast.error("Erro ao atualizar QR Code");
      setIsGeneratingQRCode(false);
      return false;
    }
  }, [retryCount, MAX_RETRIES]);

  return {
    qrCodeImage,
    setQrCodeImage,
    isGeneratingQRCode,
    updateQRCode
  };
};
