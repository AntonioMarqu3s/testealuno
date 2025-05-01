
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trash, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Agent } from "@/services/agent/agentStorageService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

export interface AgentsListProps {
  agents: Agent[];
  onDeleteAgent?: (id: string) => void;
  onToggleConnection?: (id: string, isConnected: boolean) => void;
  isLoading?: boolean;
}

export function AgentsList({ agents, onDeleteAgent, onToggleConnection, isLoading = false }: AgentsListProps) {
  const navigate = useNavigate();
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);

  const handleViewAnalytics = (agentId: string) => {
    navigate(`/agent-analytics/${agentId}`);
  };

  const handleDeleteClick = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgentToDelete(agentId);
  };

  const handleEditClick = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Store agent in sessionStorage for edit form
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      sessionStorage.setItem('editingAgent', JSON.stringify(agent));
    }
    // Navigate to edit page
    navigate(`/edit-agent/${agentId}`);
  };

  const confirmDelete = () => {
    if (agentToDelete && onDeleteAgent) {
      onDeleteAgent(agentToDelete);
    }
    setAgentToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-muted/50">
            <CardContent className="p-6 h-24"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {agents.map((agent) => (
        <Card
          key={agent.id}
          className="transition-all hover:shadow cursor-pointer"
          onClick={() => handleViewAnalytics(agent.id)}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{agent.name}</h3>
              <p className="text-sm text-muted-foreground truncate max-w-md">
                {agent.type || "Sem descrição"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onDeleteAgent && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    onClick={(e) => handleEditClick(agent.id, e)}
                  >
                    <Edit className="h-5 w-5" />
                    <span className="sr-only">Editar agente</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDeleteClick(agent.id, e)}
                  >
                    <Trash className="h-5 w-5" />
                    <span className="sr-only">Deletar agente</span>
                  </Button>
                </>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!agentToDelete} onOpenChange={() => setAgentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Este agente será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
