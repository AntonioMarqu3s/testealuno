
import { AgentCard, AgentType } from "./AgentCard";
import { 
  Users, 
  UserCheck, 
  HeadsetIcon, 
  UserPlus,
  PlusCircle,
  Send
} from "lucide-react";

export function AgentGrid() {
  const agentTypes = [
    {
      title: "Vendedor",
      description: "Agente especializado em vendas e negociação",
      type: "sales" as AgentType,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "SDR",
      description: "Especialista em prospecção e qualificação",
      type: "sdr" as AgentType,
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      title: "Closer",
      description: "Especialista em fechamento de negócios",
      type: "closer" as AgentType,
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      title: "Atendimento",
      description: "Suporte ao cliente e atendimento",
      type: "support" as AgentType,
      icon: <HeadsetIcon className="h-5 w-5" />,
    },
    {
      title: "Disparo",
      description: "Especialista em disparo de mensagens em massa",
      type: "broadcast" as AgentType,
      icon: <Send className="h-5 w-5" />,
    },
    {
      title: "Personalizado",
      description: "Crie um agente personalizado para sua necessidade",
      type: "custom" as AgentType,
      icon: <PlusCircle className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {agentTypes.map((agent) => (
        <AgentCard
          key={agent.type}
          title={agent.title}
          description={agent.description}
          type={agent.type}
          icon={agent.icon}
        />
      ))}
    </div>
  );
}
