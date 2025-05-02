
import { AgentCard, AgentType } from "./AgentCard";

interface AgentGridProps {
  onCreateAgent: () => void;
  isChecking?: boolean;
}

export function AgentGrid({ onCreateAgent, isChecking = false }: AgentGridProps) {
  const agentTypes = [
    {
      type: "sales" as AgentType,
      title: "Agente WhatsApp",
      description: "Um agente para receber e responder mensagens no WhatsApp automaticamente.",
      icon: "💬"
    },
    {
      type: "sdr" as AgentType, 
      title: "Agente Instagram",
      description: "Um agente para gerenciar interações do Instagram.",
      icon: "📸"
    },
    {
      type: "support" as AgentType,
      title: "Agente Facebook",
      description: "Um agente para automação de mensagens no Facebook.",
      icon: "👍"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agentTypes.map((agent) => (
        <AgentCard 
          key={agent.type}
          title={agent.title}
          description={agent.description}
          icon={agent.icon}
          type={agent.type}
          onSelect={() => onCreateAgent()}
          isLoading={isChecking}
        />
      ))}
    </div>
  );
}
