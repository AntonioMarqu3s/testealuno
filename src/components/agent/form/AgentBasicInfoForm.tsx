
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

interface AgentBasicInfoFormProps {
  control: Control<any>;
  watch: (name: string) => any;
}

const AgentBasicInfoForm = ({ control, watch }: AgentBasicInfoFormProps) => {
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
                <Input placeholder="Ex: Assistente de Vendas" {...field} />
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
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="consultor" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Consultor Especialista
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="amigavel" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Vendedor Amigável
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="urgente" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Urgente com Elegância
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="calmo" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Organizador Calmo
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="outro" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Outro
                    </FormLabel>
                  </FormItem>
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
