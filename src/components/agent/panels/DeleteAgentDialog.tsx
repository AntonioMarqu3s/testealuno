
import React from "react";
import {
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteAgentDialogProps {
  agentName: string;
  onDelete: () => void;
}

export const DeleteAgentDialog: React.FC<DeleteAgentDialogProps> = ({
  agentName,
  onDelete
}) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-destructive mr-2" /> Confirmar exclusão
        </AlertDialogTitle>
        <AlertDialogDescription className="space-y-2">
          <p>Tem certeza que deseja excluir o agente "{agentName}"?</p>
          <div className="border-l-4 border-amber-500 bg-amber-50 p-3 text-amber-800 text-sm mt-2">
            <strong>Atenção:</strong> Esta ação irá:
            <ul className="list-disc pl-5 mt-1">
              <li>Excluir permanentemente os dados do agente</li>
              <li>Desconectar a instância no WhatsApp</li>
              <li>Remover qualquer histórico de conversas</li>
            </ul>
            <p className="mt-1">Esta ação não pode ser desfeita.</p>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction 
          onClick={onDelete}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};
