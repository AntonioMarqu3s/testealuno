
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";

interface AgentBasicInfoFormProps {
  control: Control<any>;
  watch: (name: string) => any;
}

const AgentBasicInfoForm = ({ control, watch }: AgentBasicInfoFormProps) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const agentType = searchParams.get('type');

  // Special personality options based on agent type
  const isSchoolAgent = agentType === 'school';
  const isHelpdeskAgent = agentType === 'helpdesk';
  
  const personalityOptions = useMemo(() => {
    if (isSchoolAgent) {
      return [
        { value: "prestativo", label: "Prestativo e Atencioso" },
        { value: "informativo", label: "Informativo e Detalhista" },
        { value: "profissional", label: "Profissional e Objetivo" },
        { value: "calmo", label: "Organizador Calmo" },
        { value: "outro", label: "Outro" },
      ];
    }
    
    if (isHelpdeskAgent) {
      return [
        { value: "tecnico", label: "Técnico e Preciso" },
        { value: "paciente", label: "Paciente e Didático" },
        { value: "resolucao", label: "Focado em Resolução" },
        { value: "proativo", label: "Proativo" },
        { value: "outro", label: "Outro" },
      ];
    }
    
    // Default personality options for other agents
    return [
      { value: "consultor", label: "Consultor Especialista" },
      { value: "amigavel", label: "Vendedor Amigável" },
      { value: "urgente", label: "Urgente com Elegância" },
      { value: "calmo", label: "Organizador Calmo" },
      { value: "outro", label: "Outro" },
    ];
  }, [isSchoolAgent, isHelpdeskAgent]);

  useEffect(() => {
    // Set default personality based on agent type if needed
  }, [isSchoolAgent, isHelpdeskAgent]);

  return (
    <Card>
      <CardContent className="pt-6">
        <FormField
          control={control}
          name="agentName"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Nome do agente</FormLabel>
              <FormControl>
                <Input 
                  placeholder={
                    isSchoolAgent ? "Ex: Assistente Escolar" : 
                    isHelpdeskAgent ? "Ex: Assistente de Suporte" : 
                    "Ex: Assistente de Vendas"
                  } 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="personality"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Escolha a personalidade do seu agente</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-3"
                >
                  {personalityOptions.map((option) => (
                    <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={option.value} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {watch("personality") === "outro" && (
          <FormField
            control={control}
            name="customPersonality"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Descreva a personalidade desejada</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AgentBasicInfoForm;
