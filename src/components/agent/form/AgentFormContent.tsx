import React from "react";
import { Form } from "@/components/ui/form";
import FormProgress from "./FormProgress";
import AgentBasicInfoForm from "./AgentBasicInfoForm";
import CompanyInfoForm from "./CompanyInfoForm";
import ProductInfoForm from "./ProductInfoForm";
import FormNavigation from "./FormNavigation";
import { UseFormReturn } from "react-hook-form";
import { AgentFormValues } from "./agentSchema";

interface AgentFormContentProps {
  form: UseFormReturn<AgentFormValues>;
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: (values: AgentFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  agentType?: string;
}

const AgentFormContent: React.FC<AgentFormContentProps> = ({
  form,
  step,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isSubmitting,
  isEditing,
  agentType,
}) => {
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <AgentBasicInfoForm control={form.control} watch={form.watch} agentType={agentType} />;
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
          onBack={onBack} 
          onNext={onNext}
          isSubmitting={isSubmitting} 
          isEditing={isEditing}
        />
      </form>
    </Form>
  );
};

export default AgentFormContent;
