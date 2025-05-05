import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckIcon, ExternalLinkIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase";

// Constantes
const TRIAL_DAYS = 5;

// Planos padrão para fallback
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

interface PlanSelectorProps {
  selectedPlan: number;
  onSelectPlan: (planId: number) => void;
  showTrialInfo?: boolean;
  promoApplied?: boolean;
  showPaymentButtons?: boolean;
}

export function PlanSelector({ 
  selectedPlan, 
  onSelectPlan, 
  showTrialInfo = false,
  promoApplied = false,
  showPaymentButtons = false
}: PlanSelectorProps) {
  const [planos, setPlanos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanos() {
      setLoading(true);
      setError(null);
      try {
        // Tenta obter da tabela 'plans' primeiro
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('type', { ascending: true });

        if (error) {
          console.error('Erro ao buscar da tabela plans:', error);
          
          // Tenta obter da tabela 'planos' como fallback
          const { data: planosData, error: planosError } = await supabase
            .from('planos')
            .select('*')
            .order('id', { ascending: true });
            
          if (planosError) {
            console.error('Erro ao buscar da tabela planos:', planosError);
            setError('Não foi possível carregar os planos.');
            setPlanos(DEFAULT_PLANS);
          } else if (planosData && planosData.length > 0) {
            // Mapeia os dados da tabela 'planos' para o formato esperado
            const formattedData = planosData.map(plano => ({
              id: plano.id,
              type: plano.id, // Assume que o ID é o mesmo que o tipo
              name: plano.nome,
              description: plano.descricao || '',
              price: plano.valor,
              agent_limit: plano.agentes,
              trial_days: plano.id === 0 ? TRIAL_DAYS : null,
              recomendado: plano.recomendado || false
            }));
            setPlanos(formattedData);
          } else {
            setPlanos(DEFAULT_PLANS);
          }
        } else if (data && data.length > 0) {
          // Filtrar planos gratuitos se código promocional não estiver aplicado
          const availablePlans = promoApplied 
            ? data 
            : data.filter(p => p.type !== 0);
          setPlanos(availablePlans);
        } else {
          setPlanos(DEFAULT_PLANS);
        }
      } catch (err) {
        console.error('Erro ao buscar planos:', err);
        setError('Ocorreu um erro ao carregar os planos.');
        setPlanos(DEFAULT_PLANS);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPlanos();
  }, [promoApplied]);

  const handlePaymentClick = (planId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Aqui você pode abrir o link de pagamento real do plano, se existir
    // window.open(PAYMENT_LINKS[planId], '_blank');
  };

  return (
    <div className="space-y-3">
      <Label className="text-base">Selecione um Plano</Label>
      {loading ? (
        <div className="text-center p-4 text-gray-500">Carregando planos...</div>
      ) : error ? (
        <div className="text-center p-4 text-red-500">{error}</div>
      ) : (
        <RadioGroup
          defaultValue={String(selectedPlan)}
          value={String(selectedPlan)}
          onValueChange={(value) => onSelectPlan(Number(value))}
          className="grid gap-3"
        >
          {planos.map((plano) => {
            const isFree = plano.type === 0 || plano.price === 0;
            return (
              <Label
                key={plano.id}
                htmlFor={`plano-${plano.type}`}
                className={`flex cursor-pointer items-center rounded-lg border p-4 
                  ${selectedPlan === plano.type ? 'border-primary bg-primary/10' : 'hover:bg-accent'}
                `}
              >
                <RadioGroupItem value={String(plano.type)} id={`plano-${plano.type}`} className="mr-3" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium">
                      {plano.name}
                      {isFree && plano.trial_days && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                          {plano.trial_days} dias
                        </span>
                      )}
                    </span>
                    <span className="font-medium">
                      {isFree ? 'Gratuito' : `R$ ${Number(plano.price).toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isFree
                      ? `Comece a testar com ${plano.agent_limit} agente`
                      : `Até ${plano.agent_limit} ${plano.agent_limit === 1 ? 'agente' : 'agentes'}`
                    }
                  </p>
                  {plano.description && (
                    <p className="text-xs text-gray-500 mt-1">{plano.description}</p>
                  )}
                </div>
                {plano.recomendado && (
                  <Badge className="ml-2 bg-orange-500">
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Recomendado
                  </Badge>
                )}
                {showPaymentButtons && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="ml-2"
                    onClick={(e) => handlePaymentClick(plano.type, e)}
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-1" /> Assinar
                  </Button>
                )}
              </Label>
            );
          })}
        </RadioGroup>
      )}
      {showTrialInfo && promoApplied && (
        <p className="text-sm text-green-600">
          Com o código promocional você terá 5 dias de teste gratuito do plano básico.
        </p>
      )}
    </div>
  );
}
