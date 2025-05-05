import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, CreditCard, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string | null;
  isActive: boolean;
  metadata?: Record<string, any>;
  plan?: {
    id?: string;
    name?: string;
    agent_limit?: number;
    plan?: number;
    payment_date?: string;
    subscription_ends_at?: string;
    payment_status?: string;
    trial_ends_at?: string;
  };
}

interface UserPlanData {
  id: string;
  name: string;
  agent_limit: number;
  plan: number;
  payment_date?: string;
  subscription_ends_at?: string;
  payment_status?: string;
  trial_ends_at?: string;
}

interface UserDetailFieldsProps {
  userData: UserData | null;
  isLoading: boolean;
  onSave?: (planData: any) => Promise<void>;
}

export function UserDetailFields({ userData, isLoading, onSave }: UserDetailFieldsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for editable plan fields
  const [planType, setPlanType] = useState<number>(userData?.plan?.plan ?? 0);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(
    userData?.plan?.payment_date ? new Date(userData.plan.payment_date) : undefined
  );
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | undefined>(
    userData?.plan?.subscription_ends_at ? new Date(userData.plan.subscription_ends_at) : undefined
  );
  const [trialEndDate, setTrialEndDate] = useState<Date | undefined>(
    userData?.plan?.trial_ends_at ? new Date(userData.plan.trial_ends_at) : undefined
  );
  const [paymentStatus, setPaymentStatus] = useState<string>(userData?.plan?.payment_status || 'pending');
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'PPP');
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // If we're exiting edit mode, reset to original values
      setPlanType(userData?.plan?.plan ?? 0);
      setPaymentDate(userData?.plan?.payment_date ? new Date(userData.plan.payment_date) : undefined);
      setSubscriptionEndDate(userData?.plan?.subscription_ends_at ? new Date(userData.plan.subscription_ends_at) : undefined);
      setTrialEndDate(userData?.plan?.trial_ends_at ? new Date(userData.plan.trial_ends_at) : undefined);
      setPaymentStatus(userData?.plan?.payment_status || 'pending');
    }
    setIsEditing(!isEditing);
  };
  
  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      // If user has no plan yet, create default plan data
      const userPlanData = userData?.plan ? { ...userData.plan } : {
        id: userData?.id || '', // Use user ID if no plan ID exists
        name: getPlanName(planType),
        agent_limit: getPlanAgentLimit(planType),
        plan: planType
      };

      // Update with form values
      userPlanData.plan = planType;
      userPlanData.name = getPlanName(planType);
      userPlanData.agent_limit = getPlanAgentLimit(planType);
      
      if (paymentDate) {
        userPlanData.payment_date = format(paymentDate, "yyyy-MM-dd'T'HH:mm:ss");
      }
      
      if (subscriptionEndDate) {
        userPlanData.subscription_ends_at = format(subscriptionEndDate, "yyyy-MM-dd'T'HH:mm:ss");
      }
      
      if (trialEndDate) {
        userPlanData.trial_ends_at = format(trialEndDate, "yyyy-MM-dd'T'HH:mm:ss");
      }
      
      userPlanData.payment_status = paymentStatus;
      
      await onSave(userPlanData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving plan data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getPlanName = (plan: number) => {
    switch (plan) {
      case 0: return 'Teste Gratuito';
      case 1: return 'Inicial';
      case 2: return 'Padrão';
      case 3: return 'Premium';
      default: return 'Teste Gratuito';
    }
  };
  
  const getPlanAgentLimit = (plan: number) => {
    switch (plan) {
      case 0: return 1;
      case 1: return 1;
      case 2: return 3;
      case 3: return 10;
      default: return 1;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  
  if (!userData) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="text-center text-muted-foreground">
            Usuário não encontrado ou dados indisponíveis.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Setup default plan data if none exists
  const userPlan = userData.plan || {
    id: userData.id,  // Use user ID as plan ID if no plan exists
    name: 'Teste Gratuito',
    plan: 0,
    agent_limit: 1
  };

  return (
    <div className="space-y-6">
      {/* User Basic Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Informações do Usuário</h3>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm text-muted-foreground">ID do Usuário</Label>
              <div className="font-medium">{userData.id}</div>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <div className="font-medium">{userData.email}</div>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">Data de Registro</Label>
              <div className="font-medium">{formatDate(userData.created_at)}</div>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">Último Login</Label>
              <div className="font-medium">{userData.last_sign_in_at ? formatDate(userData.last_sign_in_at) : "Nunca"}</div>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <div>
                <Badge variant={userData.isActive ? "success" : "destructive"}>
                  {userData.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Plan Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Informações do Plano</h3>
          </div>
          {onSave && (
            <Button variant="outline" size="sm" onClick={handleEditToggle} disabled={isSaving}>
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isEditing ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm text-muted-foreground">Plano Atual</Label>
                <div className="font-medium">{userPlan?.name || 'Teste Gratuito'}</div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Limite de Agentes</Label>
                <div className="font-medium">{userPlan?.agent_limit || 1}</div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Data de Pagamento</Label>
                <div className="font-medium">
                  {userPlan?.payment_date ? formatDate(userPlan.payment_date) : "N/A"}
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Data de Expiração</Label>
                <div className="font-medium">
                  {userPlan?.subscription_ends_at ? formatDate(userPlan.subscription_ends_at) : "N/A"}
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Status do Pagamento</Label>
                <div>
                  <Badge 
                    variant={
                      userPlan?.payment_status === 'completed' ? 'success' : 
                      userPlan?.payment_status === 'pending' ? 'secondary' : 'default'
                    }
                  >
                    {userPlan?.payment_status === 'completed' ? 'Pago' : 
                     userPlan?.payment_status === 'pending' ? 'Pendente' : 
                     userPlan?.payment_status || 'N/A'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Fim do Período de Teste</Label>
                <div className="font-medium">
                  {userPlan?.trial_ends_at ? formatDate(userPlan.trial_ends_at) : "N/A"}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-type">Tipo de Plano</Label>
                <Select
                  value={String(planType)}
                  onValueChange={(value) => setPlanType(parseInt(value, 10))}
                >
                  <SelectTrigger id="plan-type">
                    <SelectValue placeholder="Selecione o Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Teste Gratuito</SelectItem>
                    <SelectItem value="1">Inicial</SelectItem>
                    <SelectItem value="2">Padrão</SelectItem>
                    <SelectItem value="3">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-status">Status do Pagamento</Label>
                <Select
                  value={paymentStatus}
                  onValueChange={setPaymentStatus}
                >
                  <SelectTrigger id="payment-status">
                    <SelectValue placeholder="Status do Pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Pago</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-date">Data de Pagamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="payment-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP") : "Selecionar Data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={setPaymentDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subscription-end">Fim da Assinatura</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="subscription-end"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !subscriptionEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {subscriptionEndDate ? format(subscriptionEndDate, "PPP") : "Selecionar Data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={subscriptionEndDate}
                      onSelect={setSubscriptionEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trial-end">Fim do Período de Teste</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="trial-end"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !trialEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {trialEndDate ? format(trialEndDate, "PPP") : "Selecionar Data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={trialEndDate}
                      onSelect={setTrialEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
