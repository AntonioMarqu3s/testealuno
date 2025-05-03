
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, Calendar, CheckCircle, Clock, X, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PlanType } from "@/services/plan/userPlanService";

interface UserPlan {
  id: string;
  user_id: string;
  plan: PlanType;
  name: string;
  agent_limit: number;
  trial_ends_at: string | null;
  payment_date: string | null;
  subscription_ends_at: string | null;
  payment_status: string | null;
  connect_instancia: boolean;
  updated_at: string;
  trial_init: string | null;
}

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: Record<string, any>;
  plan?: UserPlan;
}

interface UserDetailsProps {
  userId: string;
}

export function UserDetails({ userId }: UserDetailsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch user data from auth
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) {
        throw new Error(`Erro ao buscar dados do usuário: ${authError.message}`);
      }
      
      if (!authData?.user) {
        throw new Error("Usuário não encontrado");
      }
      
      // Fetch user plan data
      const { data: planData, error: planError } = await supabase
        .from("user_plans")
        .select("*")
        .eq("user_id", userId)
        .single();
        
      if (planError && planError.code !== 'PGRST116') { // Not found error
        console.error("Erro ao buscar plano:", planError);
      }
      
      // Set combined user data
      setUserData({
        id: authData.user.id,
        email: authData.user.email || "",
        created_at: authData.user.created_at,
        last_sign_in_at: authData.user.last_sign_in_at,
        user_metadata: authData.user.user_metadata || {},
        plan: planData || undefined
      });
      
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar dados");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const renderPlanStatus = () => {
    if (!userData?.plan) return null;
    
    const now = new Date();
    const trialEndsAt = userData.plan.trial_ends_at ? new Date(userData.plan.trial_ends_at) : null;
    const subscriptionEndsAt = userData.plan.subscription_ends_at ? new Date(userData.plan.subscription_ends_at) : null;
    
    if (trialEndsAt && trialEndsAt > now) {
      const daysLeft = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return (
        <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
          <Clock className="h-4 w-4" />
          <span>Período de teste ({daysLeft} dias restantes)</span>
        </div>
      );
    }
    
    if (userData.plan.payment_status === "completed" && subscriptionEndsAt && subscriptionEndsAt > now) {
      return (
        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          <span>Assinatura ativa</span>
        </div>
      );
    }
    
    if (userData.plan.payment_status === "pending") {
      return (
        <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
          <AlertTriangle className="h-4 w-4" />
          <span>Pagamento pendente</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
        <X className="h-4 w-4" />
        <span>Assinatura expirada</span>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!userData) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Dados do usuário não encontrados</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6 py-2">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Informações Gerais</TabsTrigger>
          <TabsTrigger value="plan">Dados do Plano</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
            <p className="font-mono text-sm">{userData.id}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p>{userData.email}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Data de criação</h3>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm">{formatDate(userData.created_at)}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Último login</h3>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm">{formatDate(userData.last_sign_in_at)}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <div className={cn(
              "px-2.5 py-0.5 rounded-full text-xs inline-block",
              userData.last_sign_in_at ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
              {userData.last_sign_in_at ? "Ativo" : "Inativo"}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Metadados</h3>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(userData.user_metadata, null, 2)}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="plan" className="space-y-4 mt-4">
          {userData.plan ? (
            <>
              <div className="border p-4 rounded-md bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{userData.plan.name}</h3>
                    {renderPlanStatus()}
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      {userData.plan.plan === 0 ? "Free Trial" : 
                       userData.plan.plan === 1 ? "Básico" :
                       userData.plan.plan === 2 ? "Standard" :
                       userData.plan.plan === 3 ? "Premium" : "Desconhecido"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Limite de Agentes</h3>
                  <p className="text-sm">{userData.plan.agent_limit}</p>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Status de Pagamento</h3>
                  <p className="text-sm capitalize">{userData.plan.payment_status || "N/A"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Data de Pagamento</h3>
                  <p className="text-sm">{userData.plan.payment_date ? formatDate(userData.plan.payment_date) : "N/A"}</p>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Expiração da Assinatura</h3>
                  <p className="text-sm">{userData.plan.subscription_ends_at ? formatDate(userData.plan.subscription_ends_at) : "N/A"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Início do Trial</h3>
                  <p className="text-sm">{userData.plan.trial_init ? formatDate(userData.plan.trial_init) : "N/A"}</p>
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">Fim do Trial</h3>
                  <p className="text-sm">{userData.plan.trial_ends_at ? formatDate(userData.plan.trial_ends_at) : "N/A"}</p>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Connect Instancia</h3>
                <p className="text-sm">{userData.plan.connect_instancia ? "Sim" : "Não"}</p>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium text-muted-foreground">Última Atualização</h3>
                <p className="text-sm">{formatDate(userData.plan.updated_at)}</p>
              </div>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Este usuário não possui um plano cadastrado.</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              Editar Plano
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
