
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, CreditCard, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserPlanInfoProps {
  plan: number;
  planName: string;
  agentLimit?: number;
  paymentStatus?: string;
  paymentDate?: string;
  subscriptionEndsAt?: string;
  trialEndsAt?: string;
  connectInstancia?: boolean;
}

export function UserPlanInfo({ 
  plan, 
  planName,
  agentLimit = 1,
  paymentStatus,
  paymentDate,
  subscriptionEndsAt,
  trialEndsAt,
  connectInstancia
}: UserPlanInfoProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getPaymentStatusBadge = () => {
    if (!paymentStatus) return null;
    
    switch(paymentStatus) {
      case 'completed':
        return <Badge variant="success">Completo</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>;
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>;
    }
  };

  const getPlanBadge = () => {
    switch(plan) {
      case 0:
        return <Badge variant="outline">Teste Gratuito</Badge>;
      case 1:
        return <Badge variant="outline">Básico</Badge>;
      case 2:
        return <Badge variant="outline">Padrão</Badge>;
      case 3:
        return <Badge variant="outline">Premium</Badge>;
      default:
        return <Badge variant="outline">{planName}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 px-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="font-medium">Tipo do Plano</span>
              {getPlanBadge()}
            </div>
            {getPaymentStatusBadge()}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Limite de Agentes</p>
              <div className="flex items-center gap-1 mt-1">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>{agentLimit}</span>
              </div>
            </div>

            {paymentDate && (
              <div>
                <p className="text-sm text-muted-foreground">Data de Pagamento</p>
                <div className="flex items-center gap-1 mt-1">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                  <span>{formatDate(paymentDate)}</span>
                </div>
              </div>
            )}

            {subscriptionEndsAt && (
              <div>
                <p className="text-sm text-muted-foreground">Expiração</p>
                <div className="flex items-center gap-1 mt-1">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                  <span>{formatDate(subscriptionEndsAt)}</span>
                </div>
              </div>
            )}

            {trialEndsAt && (
              <div>
                <p className="text-sm text-muted-foreground">Trial até</p>
                <div className="flex items-center gap-1 mt-1">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                  <span>{formatDate(trialEndsAt)}</span>
                </div>
              </div>
            )}
            
            {connectInstancia !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Connect Instancia</p>
                <Badge variant={connectInstancia ? "success" : "secondary"} className="mt-1">
                  {connectInstancia ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
