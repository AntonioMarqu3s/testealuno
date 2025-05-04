import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserData } from "@/hooks/admin/useUserDetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Bot, 
  CalendarIcon, 
  Edit2Icon, 
  SaveIcon, 
  CheckCircle2, 
  XCircle,
  Clock,
  User,
  CreditCard,
  Calendar,
  AlertCircle
} from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlan } from "@/types/admin";

interface Agent {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  createdAt: Date;
  instanceId: string;
  clientIdentifier?: string;
  connectInstancia: boolean;
  userId: string;
}

const PLAN_TYPES = {
  FREE_TRIAL: {
    id: 0,
    name: "Trial Gratuito",
    agent_limit: 1,
    description: "1 agente por 5 dias"
  },
  BASIC: {
    id: 1,
    name: "Básico",
    agent_limit: 1,
    description: "1 agente"
  },
  STANDARD: {
    id: 2,
    name: "Padrão",
    agent_limit: 3,
    description: "3 agentes"
  },
  PREMIUM: {
    id: 3,
    name: "Premium",
    agent_limit: 10,
    description: "10 agentes"
  }
} as const;

interface UserDetailFieldsProps {
  userData: UserData | null;
  isLoading: boolean;
  onSave: (data: Partial<UserData>) => Promise<void>;
}

export function UserDetailFields({ userData, isLoading, onSave }: UserDetailFieldsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [userAgents, setUserAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [editingInstanceId, setEditingInstanceId] = useState<string | null>(null);
  const [newInstanceName, setNewInstanceName] = useState("");

  const isTrialActive = useMemo(() => {
    if (!userData?.plan?.trial_ends_at || !userData.created_at) return false;
    const trialEnd = new Date(userData.plan.trial_ends_at);
    const createdAt = new Date(userData.created_at);
    const expectedTrialEnd = addDays(createdAt, 5);
    return trialEnd > new Date() && trialEnd <= expectedTrialEnd;
  }, [userData]);

  useEffect(() => {
    const fetchUserAgents = async () => {
      if (!userData?.id) return;
      
      setIsLoadingAgents(true);
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', userData.id);
          
        if (error) throw error;
        
        const agents = data.map(agent => ({
          id: agent.id,
          name: agent.name,
          type: agent.type,
          isConnected: agent.is_connected || false,
          createdAt: new Date(agent.created_at),
          instanceId: agent.instance_id,
          clientIdentifier: agent.client_identifier,
          connectInstancia: agent.connect_instancia || false,
          userId: agent.user_id
        }));
        
        setUserAgents(agents);
      } catch (error) {
        console.error('Erro ao carregar agentes:', error);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchUserAgents();
  }, [userData?.id]);

  const handleToggleConnection = async (agentId: string, isConnected: boolean) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ 
          is_connected: isConnected,
          connect_instancia: isConnected
        })
        .eq('id', agentId);
        
      if (error) throw error;
      
      setUserAgents(agents => agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, isConnected, connectInstancia: isConnected }
          : agent
      ));
      
      toast.success(
        isConnected ? "Agente conectado com sucesso" : "Agente desconectado com sucesso"
      );
    } catch (error) {
      console.error('Erro ao atualizar status do agente:', error);
      toast.error("Erro ao atualizar status do agente");
    }
  };

  const handleEditInstanceName = (agent: Agent) => {
    setEditingInstanceId(agent.id);
    setNewInstanceName(agent.instanceId);
  };

  const handleSaveInstanceName = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ instance_id: newInstanceName })
        .eq('id', agentId);
        
      if (error) throw error;
      
      setUserAgents(agents => agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, instanceId: newInstanceName }
          : agent
      ));
      
      setEditingInstanceId(null);
      toast.success("Nome da instância atualizado com sucesso");
    } catch (error) {
      console.error('Erro ao atualizar nome da instância:', error);
      toast.error("Erro ao atualizar nome da instância");
    }
  };

  // Set initial edited data when entering edit mode
  useEffect(() => {
    if (isEditing && userData) {
      setEditedData({
        plan: userData.plan ? { ...userData.plan } : undefined
      });
    }
  }, [isEditing, userData]);

  if (isLoading) {
    return (
      <div className="w-[600px]">
        <Skeleton className="h-[150px]" />
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  if (!userData) {
    return (
      <Card className="w-[600px]">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Usuário não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = () => {
    setEditedData({
      plan: userData.plan ? {
        ...userData.plan,
      } : undefined
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const handlePlanChange = (planId: string) => {
    const numPlanId = parseInt(planId);
    const selectedPlan = Object.values(PLAN_TYPES).find(p => p.id === numPlanId);
    if (!selectedPlan) return;

    let trialEndsAt = null;
    if (numPlanId === 0) { // FREE_TRIAL
      trialEndsAt = addDays(new Date(), 5).toISOString();
    }

    // Ensure we have a valid plan ID
    const planId = userData?.plan?.id || `plan-${userData?.id || 'new'}`;

    setEditedData({
      ...editedData,
      plan: {
        ...(editedData.plan || userData.plan || {}),
        id: planId,
        plan: numPlanId,
        name: selectedPlan.name,
        agent_limit: selectedPlan.agent_limit,
        trial_ends_at: trialEndsAt
      } as UserPlan
    });
  };

  const handlePaymentStatusChange = (value: string) => {
    // Ensure we have a valid plan ID
    const planId = userData?.plan?.id || `plan-${userData?.id || 'new'}`;

    setEditedData({
      ...editedData,
      plan: {
        ...(editedData.plan || userData.plan || {}),
        id: planId,
        payment_status: value
      } as UserPlan
    });
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    // Ensure we have a valid plan ID
    const planId = userData?.plan?.id || `plan-${userData?.id || 'new'}`;

    setEditedData({
      ...editedData,
      plan: {
        ...(editedData.plan || userData.plan || {}),
        id: planId,
        [field]: date ? date.toISOString() : null
      } as UserPlan
    });
  };

  const handleConnectInstanciaChange = (checked: boolean) => {
    // Ensure we have a valid plan ID
    const planId = userData?.plan?.id || `plan-${userData?.id || 'new'}`;

    setEditedData({
      ...editedData,
      plan: {
        ...(editedData.plan || userData.plan || {}),
        id: planId,
        connect_instancia: checked
      } as UserPlan
    });
  };

  return (
    <div className="w-[600px]">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold truncate">{userData.email}</h2>
            <p className="text-sm text-muted-foreground">
              ID: {userData.id}
            </p>
          </div>
        </div>
        <Badge variant={userData.isActive ? "success" : "destructive"} className="h-6">
          {userData.isActive ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full justify-start mt-4">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Plano
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agentes ({userAgents.length})
          </TabsTrigger>
        </TabsList>

        {/* Aba de Informações Básicas */}
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Criado em</Label>
                  <p className="flex items-center gap-2 mt-1 text-sm">
                    <Calendar className="h-3 w-3 text-primary" />
                    {formatDate(userData.created_at)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Último login</Label>
                  <p className="flex items-center gap-2 mt-1 text-sm">
                    <Clock className="h-3 w-3 text-primary" />
                    {userData.last_sign_in_at ? formatDate(userData.last_sign_in_at) : "Nunca"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba do Plano */}
        <TabsContent value="plan" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Informações do Plano
                </h3>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEdit} className="h-8">
                    <Edit2Icon className="h-3 w-3 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving} className="h-8">
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8">
                      <SaveIcon className="h-3 w-3 mr-2" />
                      {isSaving ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Tipo do Plano</Label>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Select
                        value={String(editedData.plan?.plan ?? (userData.plan?.plan || 0))}
                        onValueChange={handlePlanChange}
                      >
                        <SelectTrigger className="w-full h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(PLAN_TYPES).map((plan) => (
                            <SelectItem 
                              key={plan.id} 
                              value={String(plan.id)}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>{plan.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {plan.description}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : userData.plan ? (
                      <div className="flex items-center gap-2">
                        <Badge className="h-5 text-xs">
                          {PLAN_TYPES[Object.keys(PLAN_TYPES).find(
                            key => PLAN_TYPES[key as keyof typeof PLAN_TYPES].id === userData.plan?.plan
                          ) as keyof typeof PLAN_TYPES]?.name || "Desconhecido"}
                        </Badge>
                        {isTrialActive && (
                          <Badge variant="secondary" className="h-5 text-xs">Trial Ativo</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sem plano</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Status do Pagamento</Label>
                  {isEditing ? (
                    <Select
                      value={editedData.plan?.payment_status || userData.plan?.payment_status || 'pending'}
                      onValueChange={handlePaymentStatusChange}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="completed">Completo</SelectItem>
                        <SelectItem value="test">Teste</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : userData.plan ? (
                    <Badge variant={userData.plan.payment_status === "completed" ? "success" : "destructive"} className="h-5 text-xs">
                      {userData.plan.payment_status === "completed" ? "Completo" : 
                       userData.plan.payment_status === "pending" ? "Pendente" : "Teste"}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">N/A</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Connect Instancia</Label>
                    {isEditing ? (
                      <Switch
                        checked={editedData.plan?.connect_instancia ?? (userData.plan?.connect_instancia || false)}
                        onCheckedChange={handleConnectInstanciaChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    ) : (
                      <Badge variant={userData.plan?.connect_instancia ? "success" : "secondary"} className="h-5 text-xs">
                        {userData.plan?.connect_instancia ? "Ativo" : "Inativo"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Limite de Agentes</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedData.plan?.agent_limit ?? (userData.plan?.agent_limit || 1)}
                        onChange={(e) => setEditedData({
                          ...editedData,
                          plan: { 
                            ...(editedData.plan || userData.plan || {}), 
                            agent_limit: parseInt(e.target.value) 
                          }
                        })}
                        className="h-8 text-sm"
                        min={1}
                      />
                    ) : (
                      <p className="text-sm">{userData.plan?.agent_limit || 1}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Data do Pagamento</Label>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-8 justify-start text-left font-normal text-sm",
                              !editedData.plan?.payment_date && !userData.plan?.payment_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {editedData.plan?.payment_date ? 
                              formatDate(editedData.plan.payment_date) : 
                              userData.plan?.payment_date ?
                              formatDate(userData.plan.payment_date) :
                              "Selecione uma data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={editedData.plan?.payment_date ? 
                              new Date(editedData.plan.payment_date) : 
                              userData.plan?.payment_date ?
                              new Date(userData.plan.payment_date) :
                              undefined}
                            onSelect={(date) => handleDateChange('payment_date', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <p className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-primary" />
                        {userData.plan?.payment_date ? 
                          formatDate(userData.plan.payment_date) : 
                          "N/A"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Data de Expiração</Label>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-8 justify-start text-left font-normal text-sm",
                              !editedData.plan?.subscription_ends_at && !userData.plan?.subscription_ends_at && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {editedData.plan?.subscription_ends_at ? 
                              formatDate(editedData.plan.subscription_ends_at) : 
                              userData.plan?.subscription_ends_at ?
                              formatDate(userData.plan.subscription_ends_at) :
                              "Selecione uma data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={editedData.plan?.subscription_ends_at ? 
                              new Date(editedData.plan.subscription_ends_at) : 
                              userData.plan?.subscription_ends_at ?
                              new Date(userData.plan.subscription_ends_at) :
                              undefined}
                            onSelect={(date) => handleDateChange('subscription_ends_at', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <p className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-primary" />
                        {userData.plan?.subscription_ends_at ? 
                          formatDate(userData.plan.subscription_ends_at) : 
                          "N/A"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Data Final do Trial</Label>
                    {isEditing ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-8 justify-start text-left font-normal text-sm",
                              !editedData.plan?.trial_ends_at && !userData.plan?.trial_ends_at && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {editedData.plan?.trial_ends_at ? 
                              formatDate(editedData.plan.trial_ends_at) : 
                              userData.plan?.trial_ends_at ?
                              formatDate(userData.plan.trial_ends_at) :
                              "Selecione uma data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={editedData.plan?.trial_ends_at ? 
                              new Date(editedData.plan.trial_ends_at) : 
                              userData.plan?.trial_ends_at ?
                              new Date(userData.plan.trial_ends_at) :
                              undefined}
                            onSelect={(date) => handleDateChange('trial_ends_at', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span>{userData.plan?.trial_ends_at ? 
                          formatDate(userData.plan.trial_ends_at) : 
                          "N/A"}</span>
                        {isTrialActive && (
                          <Badge variant="secondary" className="h-5 text-xs ml-2">Trial Ativo</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Agentes */}
        <TabsContent value="agents" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {isLoadingAgents ? (
                <div className="grid grid-cols-1 gap-2">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : userAgents.length === 0 ? (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Bot className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    Este usuário não possui agentes
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4 -mr-4">
                  <div className="space-y-2">
                    {userAgents.map(agent => (
                      <div 
                        key={agent.id} 
                        className={cn(
                          "group relative bg-card rounded-lg border p-3 transition-all duration-200",
                          "hover:shadow-sm hover:border-primary/20"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm truncate">{agent.name}</p>
                              <Badge 
                                variant={agent.isConnected ? "success" : "secondary"}
                                className="hidden group-hover:flex items-center gap-1 h-5 text-xs"
                              >
                                {agent.isConnected ? (
                                  <><CheckCircle2 className="h-3 w-3" /> Conectado</>
                                ) : (
                                  <><XCircle className="h-3 w-3" /> Desconectado</>
                                )}
                              </Badge>
                            </div>

                            {editingInstanceId === agent.id ? (
                              <div className="flex items-center gap-2 mt-2">
                                <Input
                                  value={newInstanceName}
                                  onChange={(e) => setNewInstanceName(e.target.value)}
                                  className="h-7 text-xs"
                                  placeholder="Nome da instância"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2"
                                  onClick={() => handleSaveInstanceName(agent.id)}
                                >
                                  <SaveIcon className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2"
                                  onClick={() => setEditingInstanceId(null)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="truncate">{agent.instanceId}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleEditInstanceName(agent)}
                                >
                                  <Edit2Icon className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(agent.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                            </div>
                            <Separator orientation="vertical" className="h-6" />
                            <Switch
                              checked={agent.isConnected}
                              onCheckedChange={(checked) => handleToggleConnection(agent.id, checked)}
                              className="data-[state=checked]:bg-success h-5 w-9"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
