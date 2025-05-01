
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeImage: string | null;
  timerCount: number;
  connectionCheckAttempts?: number;
  isGeneratingQRCode?: boolean;
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  open,
  onOpenChange,
  qrCodeImage,
  timerCount,
  connectionCheckAttempts = 0,
  isGeneratingQRCode = false,
}) => {
  const isCheckingConnection = connectionCheckAttempts > 0;
  
  // Debug QR code image when it changes
  useEffect(() => {
    if (open && qrCodeImage) {
      console.log("QR Code image loaded in dialog, type:", typeof qrCodeImage);
      console.log("QR Code image starts with:", qrCodeImage.substring(0, 50) + "...");
      console.log("QR Code image length:", qrCodeImage.length);
      
      // Create and test the image
      const testImg = new Image();
      testImg.onload = () => {
        console.log("QR code successfully loaded in effect test");
      };
      testImg.onerror = (e) => {
        console.error("QR code failed to load in effect test:", e);
      };
      testImg.src = qrCodeImage;
    }
  }, [open, qrCodeImage]);
  
  // Add a specific effect to log when dialog opens but no QR code is available
  useEffect(() => {
    if (open && !qrCodeImage && !isGeneratingQRCode) {
      console.log("Dialog opened but no QR code available");
    }
  }, [open, qrCodeImage, isGeneratingQRCode]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
        // Prevent closing when clicking outside to avoid accidental interruptions
        if (isGeneratingQRCode || isCheckingConnection) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>QR Code do Agente</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com o aplicativo WhatsApp para conectar seu agente
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          {isGeneratingQRCode ? (
            <div className="flex flex-col justify-center items-center h-[240px] w-[240px]">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
              <p className="text-xs text-muted-foreground mt-2">Aguarde enquanto preparamos sua conexão</p>
            </div>
          ) : qrCodeImage ? (
            <>
              <div className="mb-4 border rounded-lg p-2 overflow-hidden relative bg-white">
                <img 
                  src={qrCodeImage} 
                  alt="QR Code" 
                  className="w-full h-auto max-w-[240px]"
                  loading="eager"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error("QR Code image load failed in UI");
                    console.error("Failed QR code data:", qrCodeImage ? qrCodeImage.substring(0, 50) + "..." : "null");
                    
                    // Try to reload the image once
                    const currentSrc = e.currentTarget.src;
                    if (currentSrc !== qrCodeImage && qrCodeImage) {
                      console.log("Attempting to reload QR code image");
                      setTimeout(() => {
                        e.currentTarget.src = qrCodeImage;
                      }, 1000);
                    } else {
                      // Set to placeholder on error
                      e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOdSURBVO3BQY4cOxIEwfAC//9l7x3jrYBBJNWjmRH2B2utP1hj3WCNdYM11g3WWDdYY91gjXWDNdYN1lg3WGPdYI11gzXWDdZYN1hj3WCN9YeXJPxJlW8kcJKqk4QnVZ0kfEPVScI3VJ0k/EmVb6yxbrDGusEa6wZf+LJKJ5W+odJJwkmlaYQTlU4qnVQ6SZhGOEnopNI3VPqmSt9U6ZvWWDdYY91gjXWDH/lhEk4qnSR0Ek5UTiqdJJyonFQ6SThROVF5UqWThBOVJwl/0hrrBmusG6yxbvAjf5mEE5WThBOVTsJJwknlROUk4UTlGwl/szXWDdZYN1hj3eArf7mEk4SThE6lk4SThBOVE5WThBOVTsKT1lg3WGPdYI11g6/8J1U6SThJOEk4SThJOKmYVDpRmRKeWmPdYI11gzXWDb7yn1TpJOEk4YlKJwknKicJJwmdSicJJwmdypPK32yNdYM11g3WWDf4wpclTCp9Q6WThCdVOkk4STipeKLSSUIn4YlK31TpJOEba6wbrLFusMa6wR9eSphUOkl4knCi8kSlk4QnlU4STlSeJDxR6SRhUukk4U9aY91gjXWDNdYNfuRFCZ1KJwmdSicJJwmdSicJnconCSrfUOmTEk5UOkn4xhrrBmusG6yxbvCHP0ylk4QnCSrfSOhU6iR0Ck9UThI6lScJJwknKk9aY91gjXWDNdYNfuRFCX9SpZOEJyqdJJwkPFHpJGFS6VsqnSScJExV+qY11g3WWDdYY93gCy+q9KRKJwknCScqnSR8otJJwonKpNJJwqTSScKTKn1DpZOEb6yxbrDGusEa6wY/8sNUnqh0knCi8g0JJwknCZNKJwknCU+qdJLwJOFJlX7SGusGa6wbrLFu8JW/XEKn8qRKJwlPEk5UnlQ6SThReaLSScKTKp2odJLwpDXWDdZYN1hj3eBHflilk4QTlU4SJpWeSJhUmhL+JpVOVDpJeNIa6wZrrBussbXlxUoqnSR8U8KJyknCNyV0Kp0kdAmdypOEE5Vvmk80rLFusMa6wRrrBl95UcKk0knCicqJyqTSk4QnKp0kTCqdJJyonKicJEwqnSR8otJJwjfWWDdYY91gjXWDH/mQSicJJwmdyknCpNJJwqRyktCpTCqdJEwqnSR0Kp2EE5VJ5ZPWWDdYY91gjXWDH/mXSXii0knCScKTKp0kTAmdSicJk0onCSdVOkl4knCi8qQ11g3WWDdYY93gD9Za/rDGusEa6wZrrBussbXlL22nNrxM003hAAAAAElFTkSuQmCC";
                    }
                  }}
                  onLoad={() => {
                    console.log("QR Code image loaded successfully in UI");
                  }}
                />
                {/* Add an overlay for better visibility of QR code */}
                <div className="absolute inset-0 bg-transparent pointer-events-none"></div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground text-center">
                  Novo QR Code em: <span className="font-bold">{timerCount}s</span>
                </p>
                {isCheckingConnection && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    Verificando conexão... {connectionCheckAttempts > 0 ? `(${connectionCheckAttempts})` : ''}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-[240px] w-[240px]">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-muted-foreground">Carregando QR Code...</p>
              <p className="text-xs text-muted-foreground mt-2">Aguarde enquanto preparamos sua conexão</p>
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <Button 
            variant="secondary" 
            onClick={() => {
              // Force refresh QR code
              if (!isGeneratingQRCode) {
                console.log("Manually refreshing QR code");
                onOpenChange(false);
                setTimeout(() => onOpenChange(true), 300);
              }
            }}
            disabled={isGeneratingQRCode}
          >
            Atualizar QR
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
