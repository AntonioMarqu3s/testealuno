
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchPaymentHistoryByEmail } from "@/services/checkout/checkoutService";

// Define payment type
interface Payment {
  id: string;
  userEmail: string;
  planName: string;
  amount: number;
  paymentDate: string | null;
  expirationDate: string | null;
  status: string;
}

export const PaymentHistorySearch: React.FC = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<Payment[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Format date display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
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
      // Mock data for now - in a real implementation, this would fetch from an API
      const mockPayments: Payment[] = searchEmail.includes('@') ? [
        {
          id: "1",
          userEmail: searchEmail,
          planName: "Standard",
          amount: 97.00,
          paymentDate: "2025-04-15",
          expirationDate: "2025-05-15",
          status: "completed"
        },
        {
          id: "2",
          userEmail: searchEmail,
          planName: "Premium",
          amount: 210.00,
          paymentDate: "2025-03-15",
          expirationDate: "2025-04-15",
          status: "completed"
        }
      ] : [];
      
      setSearchResults(mockPayments);
      
      if (mockPayments.length === 0) {
        toast.info("Nenhum histórico de pagamento encontrado para este usuário");
      } else {
        toast.success(`${mockPayments.length} registros encontrados`);
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

  return (
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
                    <Badge variant={payment.status === 'completed' ? 'success' : 
                            payment.status === 'pending' ? 'secondary' : 'destructive'}>
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
  );
};
