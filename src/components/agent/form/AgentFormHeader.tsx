
import React from "react";

interface AgentFormHeaderProps {
  isEditing: boolean;
}

const AgentFormHeader: React.FC<AgentFormHeaderProps> = ({ isEditing }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        {isEditing ? "Editar Agente" : "Criar Novo Agente"}
      </h1>
      <p className="text-muted-foreground mt-2">
        {isEditing 
          ? "Atualize as configurações do seu agente" 
          : "Configure seu agente personalizado em algumas etapas simples"
        }
      </p>
    </div>
  );
};

export default AgentFormHeader;
