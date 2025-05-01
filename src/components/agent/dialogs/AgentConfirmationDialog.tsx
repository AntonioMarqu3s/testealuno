
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AgentConfirmationPanel from "../AgentConfirmationPanel";
import { Agent } from "../AgentTypes";

interface AgentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  onClose: () => void;
  onAnalyze: () => void;
  onGenerateQR: () => void;
}

export const AgentConfirmationDialog: React.FC<AgentConfirmationDialogProps> = ({
  open,
  onOpenChange,
  agent,
  onClose,
  onAnalyze,
  onGenerateQR,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0" onInteractOutside={(e) => e.preventDefault()}>
        {agent && (
          <>
            <DialogTitle className="sr-only">Confirmação do Agente</DialogTitle>
            <AgentConfirmationPanel
              agent={agent}
              onClose={onClose}
              onAnalyze={onAnalyze}
              onGenerateQR={onGenerateQR}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
