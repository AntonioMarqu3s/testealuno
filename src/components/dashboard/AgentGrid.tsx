
import { AgentCard, AgentType } from "./AgentCard";

interface AgentGridProps {
  onCreateAgent: (type: AgentType) => void;
  isChecking?: boolean;
}

export function AgentGrid({ onCreateAgent, isChecking = false }: AgentGridProps) {
  const agentTypes = [
    {
      type: "sales" as AgentType,
      title: "Vendedor",
      description: "Agente especializado em vendas e negociação",
      icon: "👨‍💼"
    },
    {
      type: "sdr" as AgentType, 
      title: "SDR",
      description: "Especialista em prospecção e qualificação",
      icon: "🔍"
    },
    {
      type: "closer" as AgentType,
      title: "Closer",
      description: "Especialista em fechamento de negócio",
      icon: "🤝"
    },
    {
      type: "support" as AgentType,
      title: "Atendimento",
      description: "Suporte ao cliente e atendimento",
      icon: "🎧"
    },
    {
      type: "broadcast" as AgentType,
      title: "Disparo",
      description: "Especialista em disparos de mensagens em massa",
      icon: "📣"
    },
    {
      type: "secretary" as AgentType,
      title: "Secretária Pessoal",
      description: "Gerencia agenda, contatos e relatórios",
      icon: "📝"
    },
    {
      type: "helpdesk" as AgentType,
      title: "Helpdesk",
      description: "Suporte técnico e solução de problemas",
      icon: "🛠️"
    },
    {
      type: "custom" as AgentType,
      title: "Personalizado",
      description: "Crie um agente personalizado para sua necessidade",
      icon: "⚙️"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {agentTypes.map((agent) => (
        <AgentCard 
          key={agent.type}
          title={agent.title}
          description={agent.description}
          icon={agent.icon}
          type={agent.type}
          onSelect={() => onCreateAgent(agent.type)}
          isLoading={isChecking}
        />
      ))}
    </div>
  );
}
