
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { PlanType, PLAN_DETAILS } from "@/services/plan/planTypes";
import { toast } from "sonner";

interface UserDetailsProps {
  userId: string;
}

interface UserInfo {
  id: string;
  email: string;
  created_at: string;
  plan?: {
    id: string;
    plan: PlanType;
    name: string;
    agent_limit: number;
    trial_ends_at?: string;
    subscription_ends_at?: string;
    payment_date?: string;
    payment_status?: string;
  };
  agents: any[];
}

export function UserDetails({ userId }: UserDetailsProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [agentLimit, setAgentLimit] = useState<string>("1");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("completed");
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        setLoading(true);
        
        // Fetch user from auth.users via RPC
        const { data: userData, error: userError } = await supabase.rpc("get_user_by_id", {
          p_user_id: userId
        });
        
        if (userError) throw userError;
        
        // Fetch user plan
        const { data: planData, error: planError } = await supabase
          .from("user_plans")
          .select("*")
          .eq("user_id", userId)
          .single();
          
        if (planError && planError.code !== "PGRST116") {
          console.error("Error fetching user plan:", planError);
        }
        
        // Fetch user agents
        const { data: agentsData, error: agentsError } = await supabase
          .from("agents")
          .select("*")
          .eq("user_id", userId);
          
        if (agentsError) {
          console.error("Error fetching user agents:", agentsError);
        }
        
        const userInfo: UserInfo = {
          ...userData,
          plan: planData || undefined,
          agents: agentsData || []
        };
        
        setUser(userInfo);
        
        if (planData) {
          setSelectedPlan(planData.plan.toString());
          setAgentLimit(planData.agent_limit.toString());
          
          if (planData.payment_date) {
            setPaymentDate(new Date(planData.payment_date).toISOString().split('T')[0]);
          }
          
          if (planData.subscription_ends_at) {
            setExpirationDate(new Date(planData.subscription_ends_at).toISOString().split('T')[0]);
          }
          
          if (planData.payment_status) {
            setPaymentStatus(planData.payment_status);
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Erro ao carregar detalhes do usuário");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserDetails();
  }, [userId]);

  const handleSavePlan = async () => {
    try {
      setSavingPlan(true);
      
      const planTypeInt = parseInt(selectedPlan);
      const agentLimitInt = parseInt(agentLimit);
      
      // Validate inputs
      if (isNaN(planTypeInt) || isNaN(agentLimitInt)) {
        toast.error("Valores de plano ou limite de agentes inválidos");
        return;
      }
      
      // Call function to update plan
      const { error } = await supabase.functions.invoke("admin-update-plan", {
        body: {
          userId,
          planType: planTypeInt,
          agentLimit: agentLimitInt,
          paymentDate: paymentDate || undefined,
          expirationDate: expirationDate || undefined,
          paymentStatus: paymentStatus || "completed"
        }
      });
      
      if (error) {
        toast.error("Erro ao atualizar plano", {
          description: error.message
        });
        return;
      }
      
      toast.success("Plano atualizado com sucesso");
      
      // Refresh user details
      const { data: planData } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", userId)
        .single();
        
      if (planData && user) {
        setUser({ ...user, plan: planData });
      }
    } catch (err) {
      console.error("Error updating user plan:", err);
      toast.error("Erro ao atualizar plano");
    } finally {
      setSavingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p>Usuário não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">ID do Usuário</p>
            <p className="font-mono text-sm">{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data de Criação</p>
            <p>{new Date(user.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Agentes</p>
            <p>{user.agents.length}</p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="plan">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plan">Plano</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Plano</CardTitle>
              <CardDescription>
                Atualize o plano e as configurações de assinatura do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-type">Tipo de Plano</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger id="plan-type">
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PlanType.FREE_TRIAL.toString()}>Teste Gratuito</SelectItem>
                      <SelectItem value={PlanType.BASIC.toString()}>Inicial</SelectItem>
                      <SelectItem value={PlanType.STANDARD.toString()}>Padrão</SelectItem>
                      <SelectItem value={PlanType.PREMIUM.toString()}>Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agent-limit">Limite de Agentes</Label>
                  <Input
                    id="agent-limit"
                    type="number"
                    min="1"
                    value={agentLimit}
                    onChange={(e) => setAgentLimit(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment-date">Data de Pagamento</Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiration-date">Data de Expiração</Label>
                  <Input
                    id="expiration-date"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment-status">Status do Pagamento</Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger id="payment-status">
                      <SelectValue placeholder="Status do pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSavePlan} disabled={savingPlan}>
                  {savingPlan ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Salvando...
                    </span>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agentes do Usuário</CardTitle>
              <CardDescription>
                Visualize e gerencie os agentes deste usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.agents.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Este usuário não possui agentes
                </p>
              ) : (
                <div className="space-y-4">
                  {user.agents.map((agent) => (
                    <div key={agent.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {agent.id.substring(0, 8)}... • Tipo: {agent.type}
                          </p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            agent.is_connected ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {agent.is_connected ? "Conectado" : "Desconectado"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Ações do Usuário</CardTitle>
              <CardDescription>
                Realize ações administrativas para este usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">Redefinir Senha</Button>
                <Button variant="outline">Enviar Email</Button>
                <Button variant="destructive">Desativar Conta</Button>
                <Button variant="destructive">Excluir Conta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
