
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CreateAgentForm from "@/components/agent/CreateAgentForm";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan, hasTrialExpired } from "@/services/plan/userPlanService";
import { canCreateAgent } from "@/services/plan/planLimitService";

const CreateAgent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { agentId } = useParams();
  const { toast: toastHook } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type');
  const [initialValues, setInitialValues] = useState<Partial<AgentFormValues> | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    // Check user plan status first
    const userEmail = getCurrentUserEmail();
    const userPlan = getUserPlan(userEmail);
    
    // Check if the user can create more agents
    const canCreate = canCreateAgent(userEmail);
    
    // If editing, we don't need to check plan limits
    if (agentId) {
      const storedAgent = sessionStorage.getItem('editingAgent');
      if (storedAgent) {
        setIsEdit(true);
        const agent = JSON.parse(storedAgent);
        setInitialValues({
          agentName: agent.name,
          // Add other fields as needed
        });
      }
      return;
    }
    
    // If user cannot create more agents, redirect to plans page
    if (!canCreate) {
      toast.warning("Limite de plano atingido", {
        description: "Seu plano atual não permite a criação de mais agentes. Por favor, faça upgrade para um plano maior."
      });
      navigate('/plans');
      return;
    }
    
    // Check if type is valid, if not redirect
    if (!type && !isEdit) {
      toast.info("Selecione um tipo de agente", {
        description: "Por favor, escolha um tipo de agente antes de prosseguir com a criação."
      });
      navigate('/dashboard?tab=agents');
    }
  }, [agentId, type, toastHook, navigate, isEdit]);

  // Return early if no type, but only after the useEffect has run
  if (!type && !isEdit) {
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
