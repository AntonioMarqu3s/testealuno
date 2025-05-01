
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import AgentBasicInfoForm from "./form/AgentBasicInfoForm";
import CompanyInfoForm from "./form/CompanyInfoForm";
import ProductInfoForm from "./form/ProductInfoForm";
import FormProgress from "./form/FormProgress";
import FormNavigation from "./form/FormNavigation";
import AgentConfirmationPanel from "./AgentConfirmationPanel";
import { useAgentSubmission } from "@/hooks/useAgentSubmission";
import { 
  agentFormSchema, 
  defaultValues, 
  type AgentFormValues 
} from "./form/agentSchema";
import { Agent } from "./AgentPanel";
import { getCurrentUserEmail, generateAgentInstanceId } from "@/services";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getUserAgents } from "@/services/agent/agentStorageService";

interface CreateAgentFormProps {
  agentType: string;
  isEditing?: boolean;
  agentId?: string;
  initialValues?: Partial<AgentFormValues> | null;
}

const CreateAgentForm = ({ 
  agentType, 
  isEditing = false,
  agentId,
  initialValues = null
}: CreateAgentFormProps) => {
  const [step, setStep] = useState(1);
  const { isSubmitting, handleSubmitAgent, handleUpdateAgent } = useAgentSubmission(agentType);
  const totalSteps = 3;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
  const navigate = useNavigate();
  
  // Use initialValues if provided (for editing)
  const formDefaultValues = initialValues ? { ...defaultValues, ...initialValues } : defaultValues;
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: formDefaultValues,
  });

  // Load agent data if editing
  useEffect(() => {
    if (isEditing && agentId) {
      const userEmail = getCurrentUserEmail() || "vladimirfreire@hotmail.com";
      const userAgents = getUserAgents(userEmail);
      const agentToEdit = userAgents.find(agent => agent.id === agentId);
      
      if (agentToEdit) {
        // Set form values from stored agent
        form.setValue('agentName', agentToEdit.name);
        
        // In a real implementation, we would load all other agent data here
        // This is just a basic implementation
        toast.info("Dados do agente carregados para edição", {
          description: `Editando: ${agentToEdit.name}`
        });
      }
    }
  }, [isEditing, agentId, form]);

  // Update form values if initialValues changes
  useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof AgentFormValues, value);
        }
      });
    }
  }, [initialValues, form]);

  const onSubmit = (values: AgentFormValues) => {
    const userEmail = getCurrentUserEmail() || "vladimirfreire@hotmail.com";
    const instanceId = generateAgentInstanceId(userEmail, values.agentName);
    
    // Create agent object for confirmation panel
    const agent: Agent = {
      id: isEditing && agentId ? agentId : `agent-${Date.now()}`,
      name: values.agentName,
      type: agentType,
      isConnected: false,
      createdAt: new Date(),
      instanceId
    };
    
    setCreatedAgent(agent);
    setShowConfirmation(true);
    
    // Create client identifier for the system
    const clientIdentifier = `${userEmail}-${values.agentName}`.replace(/\s+/g, '-').toLowerCase();
    console.log("Client identifier:", clientIdentifier);
    
    // Actually save or update the agent
    if (isEditing && agentId) {
      handleUpdateAgent(values, agentId);
    } else {
      handleSubmitAgent(values);
    }
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    navigate('/agents');
  };

  const handleGenerateQR = () => {
    console.log("Generating QR code for agent:", createdAgent?.name);
    // Implement QR code generation logic
  };

  const handleAnalyze = () => {
    // Navigate to analytics page
    if (createdAgent?.id) {
      handleCloseConfirmation();
      navigate(`/agent-analytics/${createdAgent.id}`);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <AgentBasicInfoForm control={form.control} watch={form.watch} />;
      case 2:
        return <CompanyInfoForm control={form.control} />;
      case 3:
        return <ProductInfoForm control={form.control} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormProgress currentStep={step} totalSteps={totalSteps} />
          
          <div className="space-y-6">
            {renderStepContent()}
          </div>

          <FormNavigation 
            step={step} 
            totalSteps={totalSteps} 
            onBack={handleBack} 
            onNext={handleNext}
            isSubmitting={isSubmitting} 
            isEditing={isEditing}
          />
        </form>
      </Form>

      {/* Agent Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md p-0" onInteractOutside={(e) => e.preventDefault()}>
          {createdAgent && (
            <>
              <DialogTitle className="sr-only">Confirmação do Agente</DialogTitle>
              <AgentConfirmationPanel
                agent={createdAgent}
                onClose={handleCloseConfirmation}
                onAnalyze={handleAnalyze}
                onGenerateQR={handleGenerateQR}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAgentForm;
