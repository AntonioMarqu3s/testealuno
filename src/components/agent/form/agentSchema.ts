
import * as z from "zod";

export const agentFormSchema = z.object({
  agentName: z.string().min(2, "Nome do agente é obrigatório"),
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

export type AgentFormValues = z.infer<typeof agentFormSchema>;

export const defaultValues: AgentFormValues = {
  agentName: "",
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
};
