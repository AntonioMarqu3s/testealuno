
import { Agent, AgentPanel } from "@/components/agent/AgentPanel";

interface AgentsListProps {
  agents: Agent[];
  onDeleteAgent: (agentId: string) => void;
  isLoading: boolean;
}

export const AgentsList = ({ agents, onDeleteAgent, isLoading }: AgentsListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-lg bg-muted animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentPanel 
          key={agent.id} 
          agent={agent} 
          onDelete={onDeleteAgent}
        />
      ))}
    </div>
  );
};
