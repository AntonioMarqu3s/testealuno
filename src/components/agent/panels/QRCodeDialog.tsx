
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
}

export const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  open,
  onOpenChange,
  qrCodeImage,
  timerCount
}) => {
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
              <p className="text-sm text-muted-foreground text-center">
                Novo QR Code em: <span className="font-bold">{timerCount}s</span>
              </p>
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
