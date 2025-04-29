
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

import AgentBasicInfoForm from "./form/AgentBasicInfoForm";
import CompanyInfoForm from "./form/CompanyInfoForm";
import ProductInfoForm from "./form/ProductInfoForm";
import FormProgress from "./form/FormProgress";
import FormNavigation from "./form/FormNavigation";
import { useAgentSubmission } from "@/hooks/useAgentSubmission";
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
  const { isSubmitting, handleSubmitAgent, handleUpdateAgent } = useAgentSubmission(agentType);
  const totalSteps = 3;
  
  // Use initialValues if provided (for editing)
  const formDefaultValues = initialValues ? { ...defaultValues, ...initialValues } : defaultValues;
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: formDefaultValues,
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
  );
};

export default CreateAgentForm;
