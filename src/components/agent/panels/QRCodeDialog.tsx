
import React, { useEffect, useState } from "react";
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
  onConnected?: () => void;
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  open,
  onOpenChange,
  qrCodeImage,
  timerCount,
  onConnected
}) => {
  // Add polling to check connection status when QR code is displayed
  const [checkingConnection, setCheckingConnection] = useState(false);
  
  useEffect(() => {
    let connectionCheckInterval: number | null = null;
    
    // Start polling for connection status when QR code is displayed
    if (open && qrCodeImage) {
      setCheckingConnection(true);
      
      // Poll every 5 seconds to check if connection was established
      connectionCheckInterval = window.setInterval(async () => {
        try {
          console.log("Checking connection status...");
          const instanceId = sessionStorage.getItem('currentInstanceId');
          
          if (!instanceId) {
            console.log("No instance ID found to check status");
            return;
          }
          
          const response = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/verificar-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ instanceId }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to check connection status');
          }
          
          const data = await response.json();
          console.log("Connection status:", data);
          
          // If connected, trigger the onConnected callback
          if (data.status === 'connected' || data.isConnected === true) {
            console.log("Agent is now connected!");
            setCheckingConnection(false);
            
            if (connectionCheckInterval) {
              window.clearInterval(connectionCheckInterval);
            }
            
            if (onConnected) {
              onConnected();
              onOpenChange(false); // Close dialog when connected
            }
          }
        } catch (error) {
          console.error("Error checking connection status:", error);
        }
      }, 5000); // Check every 5 seconds
    }
    
    // Cleanup interval when dialog closes
    return () => {
      if (connectionCheckInterval) {
        window.clearInterval(connectionCheckInterval);
        setCheckingConnection(false);
      }
    };
  }, [open, qrCodeImage, onConnected, onOpenChange]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code do Agente</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com o aplicativo WhatsApp para conectar seu agente
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6">
          {qrCodeImage ? (
            <>
              <div className="mb-4 border rounded-lg p-2 overflow-hidden">
                <img 
                  src={qrCodeImage} 
                  alt="QR Code" 
                  className="w-full h-auto max-w-[240px]"
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground text-center">
                  Novo QR Code em: <span className="font-bold">{timerCount}s</span>
                </p>
                {checkingConnection && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    Verificando conexão...
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-[240px] w-[240px]">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
