
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CreateAgentForm from "@/components/agent/CreateAgentForm";
import { useToast } from "@/hooks/use-toast";
import { AgentFormValues } from "@/components/agent/form/agentSchema";

const CreateAgent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { agentId } = useParams();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type');
  const [initialValues, setInitialValues] = useState<Partial<AgentFormValues> | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    // Check if we're in edit mode
    if (agentId) {
      const storedAgent = sessionStorage.getItem('editingAgent');
      if (storedAgent) {
        const agent = JSON.parse(storedAgent);
        setIsEdit(true);
        
        // Map agent data to form values
        setInitialValues({
          agentName: agent.name,
          // Add other fields as needed - in a real app you'd fetch complete data from API
          // This is just a starting point
        });
      }
    }
  }, [agentId]);

  if (!type) {
    toast({
      title: "Selecione um tipo de agente",
      description: "Por favor, escolha um tipo de agente antes de prosseguir com a criação.",
    });
    navigate('/dashboard?tab=agents');
    return null;
  }

  return (
    <MainLayout title={isEdit ? "Editar Agente" : "Criar Agente"}>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Editar Agente" : "Criar Novo Agente"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEdit 
              ? "Atualize as configurações do seu agente" 
              : "Configure seu agente personalizado em algumas etapas simples"
            }
          </p>
        </div>
        <CreateAgentForm 
          agentType={type} 
          isEditing={isEdit}
          agentId={agentId}
          initialValues={initialValues}
        />
      </div>
    </MainLayout>
  );
};

export default CreateAgent;
