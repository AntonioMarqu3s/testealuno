
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AgentFormContent from "./form/AgentFormContent";
import { AgentConfirmationDialog } from "./dialogs/AgentConfirmationDialog";
import { useAgentSubmission } from "@/hooks/useAgentSubmission";
import { useAgentConfirmation } from "./hooks/useAgentConfirmation";
import { 
  agentFormSchema, 
  defaultValues, 
  type AgentFormValues 
} from "./form/agentSchema";

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
  const navigate = useNavigate();
  const totalSteps = 3;
  
  const { isSubmitting, handleSubmitAgent, handleUpdateAgent } = useAgentSubmission(agentType);
  const { 
    showConfirmation, 
    createdAgent, 
    setShowConfirmation,
    handleCloseConfirmation,
    handleAnalyze,
    handleGenerateQR,
    prepareAgentConfirmation 
  } = useAgentConfirmation(agentType);
  
  // Use initialValues if provided (for editing)
  const formDefaultValues = initialValues ? { ...defaultValues, ...initialValues } : defaultValues;
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: formDefaultValues,
    mode: "onChange"
  });

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
    console.log("Form submitted with values:", values);
    
    // Create agent object and show confirmation dialog
    const agent = prepareAgentConfirmation(values, isEditing ? agentId : undefined);
    
    // Actually save or update the agent
    if (isEditing && agentId) {
      handleUpdateAgent(values, agentId);
    } else {
      handleSubmitAgent(values);
    }
  };

  const handleNext = async () => {
    // Validate the current step before proceeding
    const fieldsToValidate = getFieldsForCurrentStep();
    const isValid = await form.trigger(fieldsToValidate as any[]);
    
    if (isValid) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Helper function to determine which fields to validate based on current step
  const getFieldsForCurrentStep = (): (keyof AgentFormValues)[] => {
    switch (step) {
      case 1:
        return ['agentName', 'personality', 'customPersonality'];
      case 2:
        return ['companyName', 'companyDescription', 'segment', 'mission', 'vision', 'mainDifferentials', 'competitors', 'commonObjections'];
      case 3:
        return ['productName', 'productDescription', 'problemsSolved', 'benefits', 'differentials'];
      default:
        return [];
    }
  };

  return (
    <>
      <AgentFormContent
        form={form}
        step={step}
        totalSteps={totalSteps}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
      />

      {/* Agent Confirmation Dialog */}
      <AgentConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        agent={createdAgent}
        onClose={handleCloseConfirmation}
        onAnalyze={handleAnalyze}
        onGenerateQR={handleGenerateQR}
      />
    </>
  );
};

export default CreateAgentForm;
