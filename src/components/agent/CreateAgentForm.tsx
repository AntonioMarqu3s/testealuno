
import { useState } from "react";
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
}

const CreateAgentForm = ({ agentType }: CreateAgentFormProps) => {
  const [step, setStep] = useState(1);
  const { isSubmitting, handleSubmitAgent } = useAgentSubmission(agentType);
  const totalSteps = 3;
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues,
  });

  const onSubmit = (values: AgentFormValues) => {
    handleSubmitAgent(values);
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
        />
      </form>
    </Form>
  );
};

export default CreateAgentForm;
