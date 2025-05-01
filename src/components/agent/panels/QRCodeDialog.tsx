
import React from "react";
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
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  open,
  onOpenChange,
  qrCodeImage,
  timerCount,
  connectionCheckAttempts = 0,
}) => {
  const isCheckingConnection = connectionCheckAttempts > 0;
  
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
                {isCheckingConnection && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    Verificando conexão... {connectionCheckAttempts > 0 ? `(${connectionCheckAttempts})` : ''}
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
