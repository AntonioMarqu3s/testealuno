
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface CompanyInfoFormProps {
  control: Control<any>;
}

const CompanyInfoForm = ({ control }: CompanyInfoFormProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
};

export default CompanyInfoForm;
