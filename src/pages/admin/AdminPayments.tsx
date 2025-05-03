import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarIcon, Loader, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PlanType } from "@/services/plan/planTypes";
import { toast } from "sonner";
import { fetchPaymentHistoryByEmail } from "@/services/checkout/checkoutService";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminPayments() {
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
  
  // Search related states
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Mock payment data for the table
  const recentPayments = [
    {
      id: "1",
      userEmail: "usuario1@exemplo.com",
      planName: "Padrão",
      amount: 210.00,
      paymentDate: "2024-04-15",
      expirationDate: "2024-05-15",
      status: "completed"
    },
    {
      id: "2",
      userEmail: "usuario2@exemplo.com",
      planName: "Premium",
      amount: 700.00,
      paymentDate: "2024-04-13",
      expirationDate: "2024-05-13",
      status: "completed"
    },
    {
      id: "3",
      userEmail: "usuario3@exemplo.com",
      planName: "Inicial",
      amount: 97.00,
      paymentDate: "2024-04-10",
      expirationDate: "2024-05-10",
      status: "completed"
    }
  ];

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

  // Handle search for user payment history
  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast.error("Digite um email para pesquisar");
      return;
    }
    
    setSearching(true);
    setSearchError(null);
    setSearchPerformed(true);
    
    try {
      const { payments } = await fetchPaymentHistoryByEmail(searchEmail);
      setSearchResults(payments);
      
      if (payments.length === 0) {
        toast.info("Nenhum histórico de pagamento encontrado para este usuário");
      } else {
        toast.success(`${payments.length} registros encontrados`);
      }
    } catch (error) {
      console.error("Error searching payment history:", error);
      setSearchError("Erro ao buscar histórico de pagamento");
      setSearchResults([]);
      toast.error("Erro ao buscar histórico de pagamento");
    } finally {
      setSearching(false);
    }
  };

  // Format date display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Gerenciar Pagamentos</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
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
                        <CalendarComponent
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
                        <CalendarComponent
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
          
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Recentes</CardTitle>
              <CardDescription>
                Últimos pagamentos registrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.userEmail}</TableCell>
                      <TableCell>{payment.planName}</TableCell>
                      <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="success">
                          Pago
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        {/* New section for payment history search */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Pesquisar Histórico de Pagamentos</CardTitle>
            <CardDescription>
              Busque o histórico de pagamentos de um usuário pelo email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Digite o email do usuário"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
              </div>
              <Button onClick={handleSearch} disabled={searching} className="flex gap-2 items-center">
                {searching ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Buscar</span>
                  </>
                )}
              </Button>
            </div>
            
            {searchError && (
              <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}
            
            {searchPerformed && !searchError && (
              <div className="bg-muted rounded-md p-4 mb-4">
                <p className="font-medium">
                  {searchResults.length === 0
                    ? "Nenhum registro de pagamento encontrado para este email"
                    : `${searchResults.length} ${searchResults.length === 1 ? 'registro encontrado' : 'registros encontrados'}`}
                </p>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Expiração</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>{payment.planName}</TableCell>
                      <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{formatDate(payment.expirationDate)}</TableCell>
                      <TableCell>
                        <Badge variant={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'destructive'}>
                          {payment.status === 'completed' ? 'Pago' : 
                           payment.status === 'pending' ? 'Pendente' : 'Falhou'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Os registros de pagamento são baseados nos dados de assinatura do usuário.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}
