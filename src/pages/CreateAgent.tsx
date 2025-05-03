
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CreateAgentForm from "@/components/agent/CreateAgentForm";
import { useToast } from "@/hooks/use-toast";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan, PlanType } from "@/services/plan/userPlanService";
import { canCreateAgent } from "@/services";

const CreateAgent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { agentId } = useParams();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type');
  const [initialValues, setInitialValues] = useState<Partial<AgentFormValues> | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPlanAndPermissions = async () => {
      setIsLoading(true);
      
      // Check user plan status first
      const userEmail = getCurrentUserEmail();
      const userPlan = getUserPlan(userEmail);
      
      // If we're in edit mode, no need for additional checks
      if (agentId) {
        const storedAgent = sessionStorage.getItem('editingAgent');
        if (storedAgent) {
          const agent = JSON.parse(storedAgent);
          setIsEdit(true);
          
          // Map agent data to form values
          setInitialValues({
            agentName: agent.name,
            // Add other fields as needed - in a real app you'd fetch complete data from API
          });
        }
        
        setIsLoading(false);
        return;
      }
      
      // Check if user can create an agent
      const canCreate = await canCreateAgent(userEmail);
      
      if (!canCreate) {
        toast({
          title: userPlan.plan === PlanType.FREE_TRIAL ? 
            "Plano gratuito" : 
            "Limite de agentes atingido",
          description: userPlan.plan === PlanType.FREE_TRIAL ? 
            "Seu plano gratuito não permite a criação de agentes. Por favor, faça upgrade para um plano pago." :
            `Seu plano atual permite apenas ${userPlan.agentLimit} agentes. Faça upgrade para criar mais.`,
          variant: "destructive"
        });
        navigate('/plans');
        return;
      }
      
      // Check if type is valid, if not redirect
      if (!type && !isEdit) {
        toast({
          title: "Selecione um tipo de agente",
          description: "Por favor, escolha um tipo de agente antes de prosseguir com a criação.",
        });
        navigate('/dashboard?tab=agents');
      }
      
      setIsLoading(false);
    };
    
    checkPlanAndPermissions();
  }, [agentId, type, toast, navigate, isEdit]);

  // Return loading state or null if checks haven't completed
  if (isLoading) {
    return (
      <MainLayout title={isEdit ? "Editar Agente" : "Criar Agente"}>
        <div className="flex items-center justify-center h-64">
          <p>Carregando...</p>
        </div>
      </MainLayout>
    );
  }
  
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
