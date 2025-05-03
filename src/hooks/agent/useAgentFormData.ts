
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { getUserAgents, getCurrentUserEmail } from "@/services";
import { supabase } from "@/lib/supabase";

export const useAgentFormData = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initialValues, setInitialValues] = useState<Partial<AgentFormValues> | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAgentData = async () => {
      setIsLoading(true);
      
      if (agentId) {
        const storedAgent = sessionStorage.getItem('editingAgent');
        
        // Try getting data from sessionStorage first
        if (storedAgent) {
          const agent = JSON.parse(storedAgent);
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
          // If not in session storage, try retrieving from local storage
          const userEmail = getCurrentUserEmail();
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
      }
      
      setIsLoading(false);
    };
    
    loadAgentData();
  }, [agentId, toast, navigate]);

  return {
    initialValues,
    isEdit,
    isLoading,
    agentId
  };
};
