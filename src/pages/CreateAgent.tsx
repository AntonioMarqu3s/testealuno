
import { useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CreateAgentForm from "@/components/agent/CreateAgentForm";
import AgentFormHeader from "@/components/agent/form/AgentFormHeader";
import { useAgentFormData } from "@/hooks/agent/useAgentFormData";
import { useAgentPermissions } from "@/hooks/agent/useAgentPermissions";

const CreateAgent = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type');
  
  const { initialValues, isEdit, isLoading, agentId } = useAgentFormData();
  const { isChecking } = useAgentPermissions(type, isEdit);

  // Show loading state if either data is loading or permissions are being checked
  if (isLoading || isChecking) {
    return (
      <MainLayout title={isEdit ? "Editar Agente" : "Criar Agente"}>
        <div className="flex items-center justify-center h-64">
          <p>Carregando...</p>
        </div>
      </MainLayout>
    );
  }
  
  // Return early if no type and not editing - permissions check will handle redirect
  if (!type && !isEdit) {
    return null;
  }

  return (
    <MainLayout title={isEdit ? "Editar Agente" : "Criar Agente"}>
      <div className="max-w-3xl mx-auto space-y-8">
        <AgentFormHeader isEditing={isEdit} />
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
