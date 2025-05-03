
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Wifi, WifiOff, Calendar } from "lucide-react";
import { Agent } from "../AgentTypes";

interface AgentHeaderProps {
  agent: Agent;
  onEdit: () => void;
  onOpenDeleteDialog: () => void;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({ 
  agent, 
  onEdit, 
  onOpenDeleteDialog 
}) => {
  // Format date to DD/MM/YYYY
  const formattedDate = new Date(agent.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Format payment date if available
  const paymentDate = agent.extended?.paymentDate 
    ? new Date(agent.extended.paymentDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : null;

  return (
    <CardHeader className="pb-2 pt-6 relative">
      <div className="absolute top-2 right-2 flex space-x-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onOpenDeleteDialog}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-between items-center mt-2">
        <CardTitle className="text-xl">{agent.name}</CardTitle>
        <Badge variant={agent.isConnected ? "default" : "outline"} className="flex items-center gap-1">
          {agent.isConnected ? (
            <>
              <Wifi className="h-3 w-3" /> 
              <span>Conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" /> 
              <span>Desconectado</span>
            </>
          )}
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-xs text-muted-foreground">
          Criado em: {formattedDate}
        </p>
        
        {paymentDate && (
          <p className="text-xs text-muted-foreground flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Último pagamento: {paymentDate}</span>
          </p>
        )}
      </div>
    </CardHeader>
  );
};
