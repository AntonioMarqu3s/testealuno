
import { AgentCard } from "./AgentCard";

interface AgentGridProps {
  onCreateAgent: () => void;
  isChecking?: boolean;
}

export function AgentGrid({ onCreateAgent, isChecking = false }: AgentGridProps) {
  const agentTypes = [
    {
      type: "whatsapp",
      title: "Agente WhatsApp",
      description: "Um agente para receber e responder mensagens no WhatsApp automaticamente.",
      icon: "💬"
    },
    {
      type: "instagram",
      title: "Agente Instagram",
      description: "Um agente para gerenciar interações do Instagram.",
      icon: "📸"
    },
    {
      type: "facebook",
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
          onClick={() => onCreateAgent()}
          isLoading={isChecking}
        />
      ))}
    </div>
  );
}
