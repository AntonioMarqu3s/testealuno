
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CreateAgentForm from "@/components/agent/CreateAgentForm";
import { useToast } from "@/hooks/use-toast";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { getCurrentUserEmail } from "@/services/user/userService";
import { getUserPlan, PlanType } from "@/services/plan/userPlanService";
import { canCreateAgent, getUserAgents } from "@/services";
import { supabase } from "@/lib/supabase";

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
      
      // If we're in edit mode, load the complete agent data
      if (agentId) {
        const storedAgent = sessionStorage.getItem('editingAgent');
        
        // Try getting data from sessionStorage first
        if (storedAgent) {
          const agent = JSON.parse(storedAgent);
          setIsEdit(true);
          
          // Map agent data to form values - include all fields
          setInitialValues({
            agentName: agent.name,
            personality: agent.personality || agent.agent_data?.personality || 'consultor',
            customPersonality: agent.customPersonality || agent.agent_data?.customPersonality || '',
            companyName: agent.companyName || agent.agent_data?.companyName || '',
            companyDescription: agent.companyDescription || agent.agent_data?.companyDescription || '',
            segment: agent.segment || agent.agent_data?.segment || '',
            mission: agent.mission || agent.agent_data?.mission || '',
            vision: agent.vision || agent.agent_data?.vision || '',
            mainDifferentials: agent.mainDifferentials || agent.agent_data?.mainDifferentials || '',
            competitors: agent.competitors || agent.agent_data?.competitors || '',
            commonObjections: agent.commonObjections || agent.agent_data?.commonObjections || '',
            productName: agent.productName || agent.agent_data?.productName || '',
            productDescription: agent.productDescription || agent.agent_data?.productDescription || '',
            problemsSolved: agent.problemsSolved || agent.agent_data?.problemsSolved || '',
            benefits: agent.benefits || agent.agent_data?.benefits || '',
            differentials: agent.differentials || agent.agent_data?.differentials || '',
          });
        } else {
          // If not in session storage, try retrieving from local storage
          const userAgents = getUserAgents(userEmail);
          const agent = userAgents.find(a => a.id === agentId);
          
          if (agent) {
            setIsEdit(true);
            
            // Map agent data to form values
            setInitialValues({
              agentName: agent.name,
              personality: agent.personality || agent.agent_data?.personality || 'consultor',
              customPersonality: agent.customPersonality || agent.agent_data?.customPersonality || '',
              companyName: agent.companyName || agent.agent_data?.companyName || '',
              companyDescription: agent.companyDescription || agent.agent_data?.companyDescription || '',
              segment: agent.segment || agent.agent_data?.segment || '',
              mission: agent.mission || agent.agent_data?.mission || '',
              vision: agent.vision || agent.agent_data?.vision || '',
              mainDifferentials: agent.mainDifferentials || agent.agent_data?.mainDifferentials || '',
              competitors: agent.competitors || agent.agent_data?.competitors || '',
              commonObjections: agent.commonObjections || agent.agent_data?.commonObjections || '',
              productName: agent.productName || agent.agent_data?.productName || '',
              productDescription: agent.productDescription || agent.agent_data?.productDescription || '',
              problemsSolved: agent.problemsSolved || agent.agent_data?.problemsSolved || '',
              benefits: agent.benefits || agent.agent_data?.benefits || '',
              differentials: agent.differentials || agent.agent_data?.differentials || '',
            });
          } else {
            // As a last resort, try fetching from Supabase
            try {
              const { data: agentData, error } = await supabase
                .from('agents')
                .select('*')
                .eq('id', agentId)
                .maybeSingle();
              
              if (error) throw error;
              
              if (agentData) {
                setIsEdit(true);
                
                // Map agent data to form values
                setInitialValues({
                  agentName: agentData.name,
                  personality: agentData.agent_data?.personality || 'consultor',
                  customPersonality: agentData.agent_data?.customPersonality || '',
                  companyName: agentData.agent_data?.companyName || '',
                  companyDescription: agentData.agent_data?.companyDescription || '',
                  segment: agentData.agent_data?.segment || '',
                  mission: agentData.agent_data?.mission || '',
                  vision: agentData.agent_data?.vision || '',
                  mainDifferentials: agentData.agent_data?.mainDifferentials || '',
                  competitors: agentData.agent_data?.competitors || '',
                  commonObjections: agentData.agent_data?.commonObjections || '',
                  productName: agentData.agent_data?.productName || '',
                  productDescription: agentData.agent_data?.productDescription || '',
                  problemsSolved: agentData.agent_data?.problemsSolved || '',
                  benefits: agentData.agent_data?.benefits || '',
                  differentials: agentData.agent_data?.differentials || '',
                });
              } else {
                toast({
                  title: "Agente não encontrado",
                  description: "Não foi possível localizar o agente para edição.",
                  variant: "destructive"
                });
                navigate('/agents');
                return;
              }
            } catch (error) {
              console.error("Error loading agent data from Supabase:", error);
              toast({
                title: "Erro ao carregar dados",
                description: "Não foi possível carregar os dados do agente para edição.",
                variant: "destructive"
              });
            }
          }
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
