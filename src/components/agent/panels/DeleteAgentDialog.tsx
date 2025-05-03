
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
  isDeleting?: boolean;
}

export const DeleteAgentDialog: React.FC<DeleteAgentDialogProps> = ({
  agentName,
  onDelete,
  isDeleting = false
}) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
        <AlertDialogDescription className="space-y-2">
          <p>Tem certeza que deseja excluir o agente "{agentName}"?</p>
          <p className="font-medium text-destructive">
            Esta ação excluirá o agente permanentemente e não poderá ser desfeita.
          </p>
          <p>Todos os dados associados serão removidos do sistema.</p>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
        <AlertDialogAction 
          onClick={onDelete}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          disabled={isDeleting}
        >
          {isDeleting ? 'Excluindo...' : 'Excluir Permanentemente'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};
