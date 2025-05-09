
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PlanType } from "@/services/plan/planTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

export const PaymentRegistrationForm: React.FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [planType, setPlanType] = useState(PlanType.BASIC.toString());
  const [paymentAmount, setPaymentAmount] = useState("97.00");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });
  const [submitting, setSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate API call to register payment
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Pagamento registrado com sucesso", {
        description: `Pagamento para ${userEmail} registrado.`
      });

      // Reset form
      setUserEmail("");
      setPlanType(PlanType.BASIC.toString());
      setPaymentAmount("97.00");
      setPaymentDate(new Date());
      const newExpirationDate = new Date();
      newExpirationDate.setDate(newExpirationDate.getDate() + 30);
      setExpirationDate(newExpirationDate);
    } catch (error) {
      toast.error("Erro ao registrar pagamento");
      console.error("Error registering payment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Update payment amount based on plan type
  const handlePlanTypeChange = (value: string) => {
    setPlanType(value);
    const planTypeInt = parseInt(value);
    
    let amount = "97.00";
    switch (planTypeInt) {
      case PlanType.BASIC:
        amount = "97.00";
        break;
      case PlanType.STANDARD:
        amount = "210.00";
        break;
      case PlanType.PREMIUM:
        amount = "700.00";
        break;
    }
    
    setPaymentAmount(amount);
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-type">Plano</Label>
              <Select value={planType} onValueChange={handlePlanTypeChange}>
                <SelectTrigger id="plan-type">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PlanType.BASIC.toString()}>Inicial</SelectItem>
                  <SelectItem value={PlanType.STANDARD.toString()}>Padrão</SelectItem>
                  <SelectItem value={PlanType.PREMIUM.toString()}>Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
                    onSelect={setPaymentDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Data de Expiração</Label>
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
                    {expirationDate ? format(expirationDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={setExpirationDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={submitting}>
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
    </Card>
  );
};
