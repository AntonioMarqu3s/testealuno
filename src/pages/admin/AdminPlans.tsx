import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { getAllPlansFromSupabase } from '@/services/plan/supabsePlanDataService';

export default function AdminPlans() {
  const [plans, setPlans] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Função para buscar planos disponível para todo o componente
  const fetchPlans = React.useCallback(async () => {
    console.log('Buscando planos na página AdminPlans...');
    setIsLoading(true);
    try {
      const data = await getAllPlansFromSupabase();
      console.log('Planos carregados com sucesso:', data);
      setPlans(data);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeito inicial para carregar planos
  React.useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Planos</h1>
          <Button 
            onClick={fetchPlans} 
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Atualizar'}
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {isLoading ? (
            <div className="col-span-2 text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p>Carregando planos...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="col-span-2 text-center py-8">
              <p className="text-muted-foreground">Nenhum plano encontrado.</p>
            </div>
          ) : (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onPlanUpdated={fetchPlans}
              />
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

interface PlanCardProps {
  plan: any;
  onPlanUpdated: () => Promise<void>;
}

function PlanCard({ plan, onPlanUpdated }: PlanCardProps) {
  console.log('Renderizando PlanCard para plano:', plan);
  
  const form = useForm({
    defaultValues: {
      agentLimit: plan.agent_limit,
      trialDays: plan.trial_days,
      price: plan.price
    }
  });
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(data: any) {
    console.log('Enviando atualização de plano:', data, 'para plano ID:', plan.id);
    try {
      setIsLoading(true);
      // Verifica se estamos usando a tabela certa
      const table = 'plans';
      
      const { error } = await supabase
        .from(table)
        .update({
          agent_limit: data.agentLimit,
          trial_days: data.trialDays,
          price: data.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);
        
      if (error) {
        console.error(`Erro ao atualizar plano na tabela ${table}:`, error);
        throw error;
      }
      
      toast.success('Plano atualizado com sucesso');
      // Chama a função de callback para atualizar a lista de planos
      await onPlanUpdated();
    } catch (err: any) {
      console.error('Erro ao atualizar plano:', err);
      toast.error('Erro ao atualizar plano: ' + (err?.message || err?.error_description || JSON.stringify(err)));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>
          {plan.type === 0 && <Badge variant="outline">Gratuito</Badge>}
          {plan.type === 1 && <Badge variant="secondary">Popular</Badge>}
          {plan.type === 3 && <Badge variant="default">Premium</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</span>
          {plan.price > 0 && <span className="text-muted-foreground ml-2">/mês</span>}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Limite de Agentes</span>
            <span>{plan.agent_limit}</span>
          </div>
          {plan.trial_days !== null && (
            <div className="flex justify-between">
              <span>Período de Teste</span>
              <span>{plan.trial_days} dias</span>
            </div>
          )}
        </div>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor={`agent-limit-${plan.id}`}>Limite de Agentes</Label>
            <Input
              id={`agent-limit-${plan.id}`}
              type="number"
              {...form.register("agentLimit", { required: true, min: 1 })}
            />
          </div>
          {plan.trial_days !== null && (
            <div className="space-y-2">
              <Label htmlFor={`trial-days-${plan.id}`}>Dias de Teste</Label>
              <Input
                id={`trial-days-${plan.id}`}
                type="number"
                {...form.register("trialDays", { min: 0 })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor={`price-${plan.id}`}>Preço (R$)</Label>
            <Input
              id={`price-${plan.id}`}
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
