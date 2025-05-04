'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePayments } from "@/hooks/admin/usePayments";
import { useForm } from "react-hook-form";

interface PaymentFormData {
  email: string;
  plan: number;
  amount: number;
  payment_date: Date;
  expiration_date: Date;
}

export default function PaymentsPage() {
  const { payments, isLoading, loadPayments, createPayment } = usePayments();
  const [paymentDate, setPaymentDate] = React.useState<Date>(new Date());
  const [expirationDate, setExpirationDate] = React.useState<Date>(new Date());
  const form = useForm<PaymentFormData>();

  React.useEffect(() => {
    loadPayments();
  }, []);

  const handleSubmit = async (data: PaymentFormData) => {
    try {
      await createPayment({
        ...data,
        payment_date: paymentDate.toISOString(),
        expiration_date: expirationDate.toISOString()
      });
      form.reset();
    } catch (err) {
      console.error('Erro ao submeter pagamento:', err);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Gerenciar Pagamentos</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Registrar Novo Pagamento</CardTitle>
            <p className="text-sm text-muted-foreground">
              Registre um novo pagamento para atualizar o plano de um usuário
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email do Usuário</label>
                <Input 
                  type="email" 
                  placeholder="usuario@exemplo.com"
                  {...form.register("email", { required: true })}
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plano</label>
                  <Select onValueChange={(value) => form.setValue("plan", Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
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
                  <label className="text-sm font-medium">Valor (R$)</label>
                  <Input 
                    type="number" 
                    placeholder="0,00"
                    step="0.01"
                    {...form.register("amount", { required: true, min: 0 })}
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data do Pagamento</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(paymentDate, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                        mode="single" 
                        selected={paymentDate}
                        onSelect={(date) => date && setPaymentDate(date)}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Expiração</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(expirationDate, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                        mode="single" 
                        selected={expirationDate}
                        onSelect={(date) => date && setExpirationDate(date)}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Registrar Pagamento
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pagamentos Recentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Últimos pagamentos registrados no sistema
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground">
                <div>Usuário</div>
                <div>Plano</div>
                <div>Valor</div>
                <div>Status</div>
              </div>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-4">Carregando...</div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum pagamento registrado
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="grid grid-cols-4 items-center text-sm">
                      <div className="truncate">{payment.email}</div>
                      <div>{payment.plan_name}</div>
                      <div>R$ {payment.amount.toFixed(2)}</div>
                      <div>
                        <Badge variant="success" className="bg-emerald-500">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 