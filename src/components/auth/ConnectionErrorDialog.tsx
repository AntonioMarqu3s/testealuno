
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConnectionErrorDialogProps {
  open: boolean;
  onClose: () => void;
  onDemoLogin: () => void; // Mantemos para evitar erros de tipagem em arquivos read-only, mas não usamos
  errorDetails: string;
}

export function ConnectionErrorDialog({
  open,
  onClose,
  errorDetails,
}: ConnectionErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Erro de Conexão</DialogTitle>
          <DialogDescription>
            Não foi possível conectar ao servidor de autenticação. Por favor, verifique sua conexão com a internet e tente novamente.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono overflow-auto max-h-[100px]">
          {errorDetails}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            Tentar Novamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
