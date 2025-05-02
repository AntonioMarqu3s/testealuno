
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CreateAgentForm from "@/components/agent/CreateAgentForm";
import { useToast } from "@/hooks/use-toast";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan, PlanType } from "@/services/plan/userPlanService";

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
    // Check user plan status first
    const userEmail = getCurrentUserEmail();
    const userPlan = getUserPlan(userEmail);
    
    // If user is on FREE_TRIAL, redirect to plans page
    if (userPlan.plan === PlanType.FREE_TRIAL) {
      toast({
        title: "Plano gratuito detectado",
        description: "Seu plano atual não permite a criação de agentes. Por favor, faça upgrade para um plano pago para começar a criar agentes.",
        variant: "destructive"
      });
      navigate('/plans');
      return;
    }
    
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
    
    // Check if type is valid, if not redirect
    if (!type && !isEdit) {
      toast({
        title: "Selecione um tipo de agente",
        description: "Por favor, escolha um tipo de agente antes de prosseguir com a criação.",
      });
      navigate('/dashboard?tab=agents');
    }
  }, [agentId, type, toast, navigate, isEdit]);

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
