import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { PlanType } from "@/services/plan/planTypes";
import { supabase } from "@/lib/supabase";

// Código promocional padrão
const PROMO_CODE = "ofertamdf";
const TRIAL_DAYS = 5;

const DEFAULT_PLANS = [
  {
    id: "1",
    type: 0,
    name: "Teste Gratuito",
    description: "Comece a testar o sistema por 5 dias",
    price: 0,
    agent_limit: 1,
    trial_days: 5
  },
  {
    id: "2",
    type: 1,
    name: "Inicial",
    description: "Plano básico para pequenas necessidades",
    price: 97,
    agent_limit: 1
  },
  {
    id: "3",
    type: 2,
    name: "Padrão",
    description: "Plano ideal para a maioria dos usuários",
    price: 210,
    agent_limit: 3
  },
  {
    id: "4",
    type: 3,
    name: "Premium",
    description: "Acesso completo com recursos avançados",
    price: 700,
    agent_limit: 10
  }
];

export const SignupForm: React.FC = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isPromoCodeApplied, setIsPromoCodeApplied] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [filteredPlans, setFilteredPlans] = useState(DEFAULT_PLANS.filter(p => p.type !== 0));

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (isPromoCodeApplied) {
      setFilteredPlans(plans);
      // Auto-selecionar plano gratuito
      setSelectedPlan(0);
    } else {
      setFilteredPlans(plans.filter(p => p.type !== 0));
      if (selectedPlan === 0) {
        setSelectedPlan(1); // Seleciona Inicial se o gratuito não está visível
      }
    }
  }, [isPromoCodeApplied, plans]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('type', { ascending: true });

      if (error) {
        console.error('Erro ao carregar planos:', error);
        return;
      }

      if (data && data.length > 0) {
        setPlans(data);
        if (!isPromoCodeApplied) {
          setFilteredPlans(data.filter(p => p.type !== 0));
        } else {
          setFilteredPlans(data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar planos:', err);
    }
  };

  const applyPromoCode = () => {
    if (!promoCode.trim()) {
      toast.error("Digite um código promocional");
      return;
    }

    if (promoCode.toLowerCase() === PROMO_CODE.toLowerCase()) {
      setIsPromoCodeApplied(true);
      toast.success("Código promocional válido!", {
        description: `${TRIAL_DAYS} dias de teste gratuito.`
      });
    } else {
      toast.error("Código promocional inválido");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("As senhas não correspondem");
      return;
    }
    
    if (!selectedPlan && !isPromoCodeApplied) {
      toast.error("Selecione um plano");
      return;
    }
    
    setLoading(true);
    
    try {
      // Lógica de criação de conta aqui
      toast.success("Conta criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      toast.error("Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(99) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha segura"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="promo-code">Código Promocional</Label>
            <div className="flex gap-2">
              <Input
                id="promo-code"
                placeholder="Código promocional (opcional)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={isPromoCodeApplied}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant={isPromoCodeApplied ? "default" : "outline"}
                onClick={applyPromoCode}
                disabled={!promoCode || isPromoCodeApplied}
                className={isPromoCodeApplied ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {isPromoCodeApplied ? "Aplicado" : "Aplicar"}
              </Button>
            </div>
            {isPromoCodeApplied && (
              <p className="text-xs text-green-600">
                Código promocional válido! {TRIAL_DAYS} dias de teste gratuito.
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Label>Selecione um Plano</Label>
            
            <div className="space-y-2 pt-1">
              {filteredPlans.map((plan) => {
                const isFree = plan.type === 0;
                const isSelected = selectedPlan === plan.type;
                
                return (
                  <div 
                    key={plan.id}
                    className={`border rounded-md p-3 ${
                      isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                    } hover:border-indigo-300 transition-colors cursor-pointer`}
                    onClick={() => setSelectedPlan(plan.type)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-600' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {plan.name}
                            {isFree && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                                {plan.trial_days} dias
                              </span>
                            )}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {isFree ? 'Gratuito' : `R$ ${plan.price.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {isFree 
                            ? `Comece a testar com ${plan.agent_limit} agente` 
                            : `Até ${plan.agent_limit} ${plan.agent_limit === 1 ? 'agente' : 'agentes'}`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {isPromoCodeApplied && (
            <p className="text-sm text-green-600">
              Com o código promocional você terá {TRIAL_DAYS} dias de teste gratuito do plano básico.
            </p>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 