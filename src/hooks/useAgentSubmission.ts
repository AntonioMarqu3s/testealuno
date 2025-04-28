
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AgentFormValues } from "@/components/agent/form/agentSchema";

export const useAgentSubmission = (agentType: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAgent = (values: AgentFormValues) => {
    setIsSubmitting(true);
    
    // Simulação - normalmente aqui você faria uma chamada à API
    setTimeout(() => {
      // Salvar os dados do agente na sessão para exibir na página de agentes
      sessionStorage.setItem('newAgent', JSON.stringify({
        ...values,
        agentType
      }));
      
      toast({
        title: "Agente criado com sucesso",
        description: `O agente ${values.agentName} foi criado e está pronto para uso.`,
      });
      
      // Redirecionar para a página de agentes
      navigate('/agents');
      
      setIsSubmitting(false);
    }, 1500);
  };

  return {
    isSubmitting,
    handleSubmitAgent
  };
};
