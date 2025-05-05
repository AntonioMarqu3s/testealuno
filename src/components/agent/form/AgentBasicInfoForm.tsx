import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
  agentType?: string;
}

const agentTypeLabels: Record<string, string> = {
  sales: 'Vendedor',
  sdr: 'SDR',
  closer: 'Closer',
  support: 'Atendimento',
  broadcast: 'Disparo',
  custom: 'Personalizado',
};

const AgentBasicInfoForm = ({ control, watch, agentType }: AgentBasicInfoFormProps) => {
  const [tipos, setTipos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTiposEGrupos() {
      // Buscar tipos de agente
      const { data: tiposData } = await supabase.from('tipos_agente').select('*');
      setTipos(tiposData || []);
      // Buscar grupos do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: gruposData } = await supabase.from('grupos').select('*').eq('user_id', user.id);
        setGrupos(gruposData || []);
      }
    }
    fetchTiposEGrupos();
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        {agentType && (
          <div className="mb-4 p-2 rounded bg-primary/10 text-primary font-semibold text-center">
            Tipo selecionado: {agentTypeLabels[agentType] || agentType}
          </div>
        )}
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

        {/* Select de grupo */}
        {/* Removido: o grupo será definido posteriormente na criação de admins de grupos */}

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
