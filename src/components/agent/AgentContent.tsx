import { Badge } from '@/components/ui/badge';

export const AgentContent: React.FC<AgentContentProps> = ({ 
  agent, 
  userEmail 
}) => {
  return (
    <div>
      {agent.isConnected && (
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="success" className="bg-green-100 text-green-800">Conectado</Badge>
          <span className="text-green-700 text-sm">Seu agente está conectado!</span>
        </div>
      )}
      {/* Conteúdo original do painel do agente */}
    </div>
  );
}; 