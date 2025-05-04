
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  colorClass: string;
  isLoading?: boolean;
  previousValue?: string | number;
}

export function DashboardMetricCard({
  title,
  value,
  icon,
  description,
  colorClass,
  isLoading = false,
  previousValue
}: DashboardMetricCardProps) {
  const [animateValue, setAnimateValue] = useState(false);
  const [displayValue, setDisplayValue] = useState<string | number>(value);
  
  // Calculate if there's an increase or decrease compared to previous value
  const hasChanged = previousValue !== undefined && previousValue !== value;
  const isIncrease = hasChanged && Number(value) > Number(previousValue);
  
  // Animate value changes
  useEffect(() => {
    if (hasChanged && !isLoading) {
      setAnimateValue(true);
      setDisplayValue(value);
      
      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setAnimateValue(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, previousValue, hasChanged, isLoading]);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-9 w-16 mt-1" />
            ) : (
              <div className="flex items-center gap-2">
                <p 
                  className={`text-3xl font-bold mt-1 ${animateValue ? 'transition-all duration-500 transform scale-110' : ''}`}
                  style={{
                    color: animateValue ? (isIncrease ? 'green' : 'red') : 'inherit',
                  }}
                >
                  {displayValue}
                </p>
                
                {/* Show change indicator if we have a previous value that's different */}
                {hasChanged && (
                  <span className={`text-xs ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                    {isIncrease ? '↑' : '↓'}
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
