import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlanType, PLAN_DETAILS } from "@/services/plan/planTypes";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface PlanFormData {
  agentLimit: number;
  trialDays?: number;
  price: number;
}

export default function AdminPlans() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Gerenciar Planos</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <PlanCard 
            planType={PlanType.FREE_TRIAL}
            title="Teste Gratuito"
            description="Acesso limitado para avaliação do sistema"
            price={0}
            agentLimit={PLAN_DETAILS[PlanType.FREE_TRIAL].agentLimit}
            trialDays={PLAN_DETAILS[PlanType.FREE_TRIAL].trialDays || 0}
            badgeText="Gratuito"
            badgeVariant="outline"
          />
          
          <PlanCard 
            planType={PlanType.BASIC}
            title="Inicial"
            description="Plano básico para pequenas necessidades"
            price={PLAN_DETAILS[PlanType.BASIC].price}
            agentLimit={PLAN_DETAILS[PlanType.BASIC].agentLimit}
            badgeText="Popular"
            badgeVariant="secondary"
          />
          
          <PlanCard 
            planType={PlanType.STANDARD}
            title="Padrão"
            description="Plano ideal para a maioria dos usuários"
            price={PLAN_DETAILS[PlanType.STANDARD].price}
            agentLimit={PLAN_DETAILS[PlanType.STANDARD].agentLimit}
          />
          
          <PlanCard 
            planType={PlanType.PREMIUM}
            title="Premium"
            description="Acesso completo com recursos ilimitados"
            price={PLAN_DETAILS[PlanType.PREMIUM].price}
            agentLimit={PLAN_DETAILS[PlanType.PREMIUM].agentLimit}
            badgeText="Premium"
            badgeVariant="default"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

interface PlanCardProps {
  planType: PlanType;
  title: string;
  description: string;
  price: number;
  agentLimit: number;
  trialDays?: number;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

function PlanCard({ 
  planType, 
  title, 
  description, 
  price, 
  agentLimit, 
  trialDays,
  badgeText,
  badgeVariant = "default"
}: PlanCardProps) {
  const form = useForm<PlanFormData>({
    defaultValues: {
      agentLimit,
      trialDays,
      price
    }
  });

  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(data: PlanFormData) {
    try {
      setIsLoading(true);

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('plans')
        .update({
          agent_limit: data.agentLimit,
          trial_days: data.trialDays,
          price: data.price,
          updated_at: new Date().toISOString()
        })
        .eq('type', planType);

      if (error) throw error;

      // Atualizar no PLAN_DETAILS
      PLAN_DETAILS[planType] = {
        ...PLAN_DETAILS[planType],
        agentLimit: data.agentLimit,
        trialDays: data.trialDays,
        price: data.price
      };

      toast.success('Plano atualizado com sucesso');
    } catch (err) {
      console.error('Erro ao atualizar plano:', err);
      toast.error('Erro ao atualizar plano');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {badgeText && (
            <Badge variant={badgeVariant}>{badgeText}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">R$ {price.toFixed(2)}</span>
          {price > 0 && <span className="text-muted-foreground ml-2">/mês</span>}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Limite de Agentes</span>
            <span>{agentLimit}</span>
          </div>
          {trialDays && (
            <div className="flex justify-between">
              <span>Período de Teste</span>
              <span>{trialDays} dias</span>
            </div>
          )}
        </div>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor={`agent-limit-${planType}`}>Limite de Agentes</Label>
            <Input 
              id={`agent-limit-${planType}`} 
              type="number" 
              {...form.register("agentLimit", { required: true, min: 1 })}
            />
          </div>
          
          {trialDays !== undefined && (
            <div className="space-y-2">
              <Label htmlFor={`trial-days-${planType}`}>Dias de Teste</Label>
              <Input 
                id={`trial-days-${planType}`} 
                type="number" 
                {...form.register("trialDays", { min: 0 })}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor={`price-${planType}`}>Preço (R$)</Label>
            <Input 
              id={`price-${planType}`} 
              type="number" 
              {...form.register("price", { required: true, min: 0 })}
              step="0.01" 
            />
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Atualizando..." : "Atualizar Plano"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
