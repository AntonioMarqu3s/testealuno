
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
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

const formSchema = z.object({
  personality: z.string(),
  customPersonality: z.string().optional(),
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  companyDescription: z.string().min(10, "Descrição é obrigatória"),
  segment: z.string(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  mainDifferentials: z.string(),
  competitors: z.string().optional(),
  commonObjections: z.string(),
  productName: z.string().min(2, "Nome do produto é obrigatório"),
  productDescription: z.string().min(10, "Descrição do produto é obrigatória"),
  problemsSolved: z.string(),
  benefits: z.string(),
  differentials: z.string(),
});

interface CreateAgentFormProps {
  agentType: string;
}

const CreateAgentForm = ({ agentType }: CreateAgentFormProps) => {
  const [step, setStep] = useState(1);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personality: "consultor",
      customPersonality: "",
      companyName: "",
      companyDescription: "",
      segment: "",
      mission: "",
      vision: "",
      mainDifferentials: "",
      competitors: "",
      commonObjections: "",
      productName: "",
      productDescription: "",
      problemsSolved: "",
      benefits: "",
      differentials: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Aqui você implementará a lógica de criação do agente
  }

  const renderStep1 = () => (
    <Card>
      <CardContent className="pt-6">
        <FormField
          control={form.control}
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

        {form.watch("personality") === "outro" && (
          <FormField
            control={form.control}
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

  const renderStep2 = () => (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da empresa</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da empresa</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="segment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segmento</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: automação residencial, educação" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Missão (opcional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visão (opcional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mainDifferentials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diferenciais principais</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="competitors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concorrentes e comparação (opcional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commonObjections"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objeções comuns no mercado</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do produto/serviço</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="problemsSolved"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problemas que resolve</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="benefits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benefícios</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="differentials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diferenciais</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            Voltar
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={() => setStep(step + 1)}>
              Próximo
            </Button>
          ) : (
            <Button type="submit">
              Criar Agente
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default CreateAgentForm;
