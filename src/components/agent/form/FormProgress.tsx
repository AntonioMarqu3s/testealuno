
import React from "react";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

const FormProgress: React.FC<FormProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center gap-4">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div 
          key={i} 
          className={`h-2 flex-1 rounded-full ${i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'}`} 
        />
      ))}
    </div>
  );
};

export default FormProgress;
