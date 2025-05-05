import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PlanType } from "@/services/plan/planTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePayments } from '@/hooks/admin/usePayments';
import { getAllPlansFromSupabase } from '@/services/plan/supabsePlanDataService';
import { supabase } from "@/lib/supabase";

// Código promocional padrão, igual ao mostrado na imagem
const PROMO_CODE = "ofertamdf";
const TRIAL_DAYS = 5; // 5 dias de teste gratuito conforme imagem

export const PaymentRegistrationForm: React.FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [planId, setPlanId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<any[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [isPromoCodeApplied, setIsPromoCodeApplied] = useState(false);
  const [promoCodeMessage, setPromoCodeMessage] = useState<string | null>(null);
  const { createPayment, loadPayments } = usePayments();

  // Buscar planos reais ao montar
  useEffect(() => {
    fetchPlans();
  }, []);

  // Filtrar planos para mostrar/ocultar plano gratuito
  useEffect(() => {
    if (plans.length > 0) {
      if (isPromoCodeApplied) {
        // Se o código promocional foi aplicado, mostrar todos os planos
        setFilteredPlans(plans);
      } else {
        // Se não, filtrar o plano gratuito (type === 0 ou nome inclui "Teste Gratuito")
        setFilteredPlans(
          plans.filter(plan => 
            plan.type !== 0 && 
            !(plan.name?.toLowerCase().includes("teste") && 
              plan.name?.toLowerCase().includes("gratuito"))
          )
        );
      }
    }
  }, [plans, isPromoCodeApplied]);

  // Verificar código promocional
  const applyPromoCode = () => {
    if (!promoCode.trim()) {
      toast.error("Digite um código promocional");
      return;
    }
    
    if (promoCode.toLowerCase() === PROMO_CODE.toLowerCase()) {
      setIsPromoCodeApplied(true);
      setPromoCodeMessage(`Código válido! ${TRIAL_DAYS} dias de teste gratuito`);
      toast.success("Código promocional aplicado!", {
        description: `${TRIAL_DAYS} dias de teste gratuito.`
      });
      
      // Selecionar automaticamente o plano gratuito se disponível
      const freePlan = plans.find(plan => 
        plan.type === 0 || 
        (plan.name?.toLowerCase().includes("teste") && 
         plan.name?.toLowerCase().includes("gratuito"))
      );
      
      if (freePlan) {
        setPlanId(freePlan.id.toString());
        setPaymentAmount("0");
        
        // Atualizar data de expiração para o período de teste
        if (paymentDate) {
          const newExpirationDate = new Date(paymentDate);
          newExpirationDate.setDate(paymentDate.getDate() + TRIAL_DAYS);
          setExpirationDate(newExpirationDate);
        }
      }
    } else {
      setPromoCodeMessage("Código inválido");
      toast.error("Código promocional inválido");
    }
  };

  // Limpar código promocional
  const clearPromoCode = () => {
    setPromoCode("");
    setIsPromoCodeApplied(false);
    setPromoCodeMessage(null);
    
    // Reajustar os planos para excluir o gratuito
    if (plans.length > 0) {
      const filtered = plans.filter(plan => 
        plan.type !== 0 && 
        !(plan.name?.toLowerCase().includes("teste") && 
          plan.name?.toLowerCase().includes("gratuito"))
      );
      setFilteredPlans(filtered);
      
      // Selecionar o primeiro plano não gratuito
      if (filtered.length > 0) {
        setPlanId(filtered[0].id.toString());
        setPaymentAmount(filtered[0].price.toString());
      }
    }
  };

  async function fetchPlans() {
    setLoadingPlans(true);
    setPlansError(null);
    
    try {
      console.log('Iniciando carregamento de planos...');
      
      // Checar se a tabela plans existe
      const { count, error: countError } = await supabase
        .from('plans')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Erro ao verificar tabela plans:', countError);
      } else {
        console.log(`Tabela plans existe com ${count || 0} registros`);
      }
      
      const data = await getAllPlansFromSupabase();
      console.log('Planos retornados:', data);
      
      if (!data || data.length === 0) {
        setPlansError('Nenhum plano encontrado. Verifique a configuração do banco de dados.');
        setPlans([]);
        toast.error('Nenhum plano disponível');
      } else {
        // Ordenar planos para corresponder às imagens: Teste Gratuito, Inicial, Padrão, Premium
        const sortedPlans = [...data].sort((a, b) => {
          // Ordenar pelo tipo (0=Teste Gratuito, 1=Inicial, 2=Padrão, 3=Premium)
          return a.type - b.type;
        });
        
        // Definir os dias de teste para planos que não têm esse valor
        const enhancedPlans = sortedPlans.map(plan => {
          // Se for plano gratuito e não tiver trial_days, definir como 5 dias (como na imagem)
          if ((plan.type === 0 || plan.price === 0) && !plan.trial_days) {
            return {...plan, trial_days: TRIAL_DAYS};
          }
          return plan;
        });
        
        setPlans(enhancedPlans);
        
        // Filtrar planos inicialmente
        if (!isPromoCodeApplied) {
          const filtered = enhancedPlans.filter(plan => 
            plan.type !== 0 && 
            !(plan.name?.toLowerCase().includes("teste") && 
              plan.name?.toLowerCase().includes("gratuito"))
          );
          setFilteredPlans(filtered);
          
          // Selecionar o primeiro plano não gratuito
          if (filtered.length > 0) {
            setPlanId(filtered[0].id.toString());
            setPaymentAmount(filtered[0].price.toString());
          }
        } else {
          setFilteredPlans(enhancedPlans);
          
          // Se código já aplicado, tenta selecionar plano gratuito
          const freePlan = enhancedPlans.find(plan => 
            plan.type === 0 || 
            (plan.name?.toLowerCase().includes("teste") && 
             plan.name?.toLowerCase().includes("gratuito"))
          );
          
          if (freePlan) {
            setPlanId(freePlan.id.toString());
            setPaymentAmount("0");
          } else if (enhancedPlans.length > 0) {
            setPlanId(enhancedPlans[0].id.toString());
            setPaymentAmount(enhancedPlans[0].price.toString());
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
      setPlansError('Erro ao carregar planos. Tente novamente.');
      toast.error('Erro ao carregar planos');
      setPlans([]);
      setFilteredPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }

  // Atualizar valor ao trocar plano
  const handlePlanTypeChange = (value: string) => {
    setPlanId(value);
    const plan = plans.find(p => p.id.toString() === value);
    if (plan) setPaymentAmount(plan.price.toString());
    
    // Atualiza data de expiração para visualização
    if (paymentDate) {
      const newExpirationDate = new Date(paymentDate);
      
      // Se for plano gratuito, adiciona os dias de teste
      const selectedPlan = plans.find(p => p.id.toString() === value);
      const trialDays = selectedPlan?.trial_days || 30;
      
      newExpirationDate.setDate(paymentDate.getDate() + trialDays);
      setExpirationDate(newExpirationDate);
    }
  };

  // Atualiza data de expiração quando a data de pagamento mudar
  const handlePaymentDateChange = (date: Date | undefined) => {
    setPaymentDate(date);
    if (date) {
      const newExpirationDate = new Date(date);
      
      // Use o período do plano selecionado se disponível
      const selectedPlan = plans.find(p => p.id.toString() === planId);
      const trialDays = selectedPlan?.trial_days || 30;
      
      newExpirationDate.setDate(date.getDate() + trialDays);
      setExpirationDate(newExpirationDate);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Início do handleSubmit - Formulário enviado");
    e.preventDefault();
    
    // Validações básicas
    if (!userEmail.trim()) {
      toast.error("Email do usuário é obrigatório");
      return;
    }
    
    if (!planId) {
      toast.error("Selecione um plano");
      return;
    }
    
    if (!paymentAmount || parseFloat(paymentAmount) < 0) {
      toast.error("Informe um valor válido para o pagamento");
      return;
    }
    
    if (!paymentDate) {
      toast.error("Selecione uma data de pagamento");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Informações sobre o código promocional
      const isPromo = isPromoCodeApplied && promoCode.toLowerCase() === PROMO_CODE.toLowerCase();
      
      console.log('Enviando dados para registro de pagamento:', {
        email: userEmail,
        plano_id: parseInt(planId),
        valor: parseFloat(paymentAmount),
        data_pagamento: paymentDate.toISOString(),
        data_expiracao: expirationDate ? expirationDate.toISOString() : undefined,
        promo_code: isPromo ? promoCode : undefined,
        is_promo_applied: isPromo
      });
      
      // Mostra toast de processamento
      toast("Processando pagamento...", {
        duration: 10000, // 10 segundos
        id: "payment-processing"
      });
      
      await createPayment({
        email: userEmail,
        plano_id: parseInt(planId),
        valor: parseFloat(paymentAmount),
        data_pagamento: paymentDate ? paymentDate.toISOString() : new Date().toISOString(),
        data_expiracao: expirationDate ? expirationDate.toISOString() : undefined,
        promo_code: isPromo ? promoCode : undefined,
        is_promo_applied: isPromo
      });
      
      // Remove o toast de processamento
      toast.dismiss("payment-processing");
      
      toast.success("Pagamento registrado com sucesso", {
        description: `Pagamento para ${userEmail} registrado.`
      });
      
      // Reset form
      setUserEmail("");
      setPromoCode("");
      setIsPromoCodeApplied(false);
      setPromoCodeMessage(null);
      
      if (filteredPlans.length > 0) {
        setPlanId(filteredPlans[0].id.toString());
        setPaymentAmount(filteredPlans[0].price.toString());
      }
      setPaymentDate(new Date());
      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 30);
      setExpirationDate(newExpirationDate);
      loadPayments();
    } catch (error) {
      // Remove o toast de processamento
      toast.dismiss("payment-processing");
      
      toast.error("Erro ao registrar pagamento", {
        description: "Verifique os logs para mais detalhes."
      });
      console.error("Error registering payment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Novo Pagamento</CardTitle>
        <CardDescription>
          Registre um novo pagamento para atualizar o plano de um usuário
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plansError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de carregamento</AlertTitle>
            <AlertDescription>
              {plansError}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => fetchPlans()}
                disabled={loadingPlans}
              >
                {loadingPlans ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recarregar Planos
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-email">Email do Usuário</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </div>
          
          {/* Código Promocional - Como na imagem do formulário de registro */}
          <div className="space-y-2">
            <Label htmlFor="promo-code">Código Promocional</Label>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  id="promo-code"
                  placeholder="Código promocional (opcional)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={isPromoCodeApplied}
                  className={isPromoCodeApplied ? "bg-gray-50 pr-10" : ""}
                />
                {isPromoCodeApplied && (
                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
                )}
              </div>
              {isPromoCodeApplied ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearPromoCode}
                  className="px-3"
                >
                  Limpar
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="default" 
                  onClick={applyPromoCode}
                  disabled={!promoCode}
                  className="px-3"
                >
                  Aplicar
                </Button>
              )}
            </div>
            {promoCodeMessage && (
              <p className={`text-xs mt-1 ${isPromoCodeApplied ? "text-green-600" : "text-red-600"}`}>
                {promoCodeMessage}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan-type">Selecione um Plano</Label>
            <Select 
              value={planId} 
              onValueChange={handlePlanTypeChange}
              disabled={loadingPlans || filteredPlans.length === 0}
            >
              <SelectTrigger id="plan-type">
                <SelectValue placeholder={
                  loadingPlans 
                    ? "Carregando planos..." 
                    : filteredPlans.length === 0 
                      ? "Nenhum plano disponível" 
                      : "Selecione um plano"
                } />
              </SelectTrigger>
              <SelectContent>
                {loadingPlans ? (
                  <div className="flex items-center justify-center py-2">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span>Carregando planos...</span>
                  </div>
                ) : filteredPlans.length === 0 ? (
                  <div className="flex items-center justify-center py-2 text-destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Nenhum plano encontrado</span>
                  </div>
                ) : (
                  filteredPlans.map(plan => {
                    const isFree = plan.type === 0 || parseFloat(plan.price) === 0;
                    const hasTrialDays = !!plan.trial_days;
                    
                    return (
                      <SelectItem 
                        key={plan.id} 
                        value={plan.id.toString()}
                        className={isFree ? "bg-purple-50" : ""}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">
                            {plan.name}
                            {isFree && hasTrialDays && 
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                                {plan.trial_days} dias
                              </span>
                            }
                          </span>
                          <span className="font-semibold">
                            {isFree ? 'Gratuito' : `R$ ${parseFloat(plan.price).toFixed(2)}`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {isFree 
                            ? `Comece a testar com ${plan.agent_limit || 1} agente` 
                            : `Até ${plan.agent_limit || 1} ${plan.agent_limit === 1 ? 'agente' : 'agentes'}`
                          }
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Valor (R$)</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data do Pagamento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !paymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={handlePaymentDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Data de Expiração (calculada automaticamente)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expirationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? format(expirationDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Calculado automaticamente</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expirationDate}
                  onSelect={(date) => {}} // Desativado - apenas informativo
                  disabled={true}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting || loadingPlans || filteredPlans.length === 0}
            >
              {submitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Registrando...
                </span>
              ) : (
                "Registrar Pagamento"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      {!plansError && (
        <CardFooter className="border-t p-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Total de planos disponíveis: {filteredPlans.length}/{plans.length}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchPlans()} 
            disabled={loadingPlans}
          >
            {loadingPlans ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Recarregar</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
