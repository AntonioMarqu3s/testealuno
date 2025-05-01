
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConnectionErrorDialogProps {
  open: boolean;
  onClose: () => void;
  onDemoLogin: () => void;
  errorDetails: string;
}

export function ConnectionErrorDialog({
  open,
  onClose,
  onDemoLogin,
  errorDetails,
}: ConnectionErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Modo de Demonstração</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4">
              <p>
                O aplicativo está operando em modo de demonstração com credenciais que permitem visualizar a interface, mas não fornecem autenticação real.
              </p>
              
              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800">
                <p className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                  Para usar a autenticação completa:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                  <li>Use o botão "Modo de Demonstração" para explorar o aplicativo sem autenticação real</li>
                </ol>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {errorDetails ? `Detalhes técnicos: ${errorDetails}` : ''}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onDemoLogin}>
            Usar Modo de Demonstração
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
