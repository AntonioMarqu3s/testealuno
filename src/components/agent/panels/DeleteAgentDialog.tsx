
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
        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
        <AlertDialogDescription className="space-y-2">
          <p>
            Tem certeza que deseja excluir o agente "{agentName}"? Esta ação não pode ser desfeita.
          </p>
          <p className="font-medium text-destructive">
            ATENÇÃO: Ao excluir este agente, você perderá permanentemente todas as informações, configurações e a instância no WhatsApp associada a ele.
          </p>
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
