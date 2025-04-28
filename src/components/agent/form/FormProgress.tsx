
import React from "react";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

const FormProgress: React.FC<FormProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center gap-4">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i + 1 <= currentStep;
        const isCurrent = i + 1 === currentStep;
        
        return (
          <div key={i} className="flex-1 flex items-center">
            <div 
              className={`h-6 w-6 rounded-full flex items-center justify-center
                ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' : 
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div 
                className={`h-1 flex-1 ml-2 ${isActive ? 'bg-primary' : 'bg-muted'}`} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FormProgress;
