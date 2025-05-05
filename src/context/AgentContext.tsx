// [AGENT CONTEXT INÍCIO - rollback point]
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AgentConnectionState {
  [agentId: string]: boolean; // true = conectado, false = desconectado
}

interface AgentContextType {
  connections: AgentConnectionState;
  setAgentConnected: (agentId: string, connected: boolean) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [connections, setConnections] = useState<AgentConnectionState>({});

  const setAgentConnected = (agentId: string, connected: boolean) => {
    setConnections(prev => ({ ...prev, [agentId]: connected }));
  };

  return (
    <AgentContext.Provider value={{ connections, setAgentConnected }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgentContext deve ser usado dentro de AgentProvider');
  return context;
};
// [AGENT CONTEXT FIM - rollback point] 