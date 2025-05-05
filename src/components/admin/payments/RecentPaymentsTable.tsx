import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import { usePayments } from '@/hooks/admin/usePayments';

// Define payment type
interface Payment {
  id: string;
  userEmail: string;
  planName: string;
  amount: number;
  paymentDate: string;
  expirationDate: string;
  status: string;
}

export const RecentPaymentsTable: React.FC = () => {
  const { payments, isLoading, loadPayments } = usePayments();
  
  React.useEffect(() => { 
    loadPayments(); 
  }, []);
  
  return (
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
            {isLoading ? (
              <TableRow><TableCell colSpan={4}>Carregando...</TableCell></TableRow>
            ) : payments.length === 0 ? (
              <TableRow><TableCell colSpan={4}>Nenhum pagamento encontrado</TableCell></TableRow>
            ) : payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.email}</TableCell>
                <TableCell>{payment.plano_nome}</TableCell>
                <TableCell>R$ {payment.valor.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                    {payment.status === 'completed' ? 'Pago' : payment.status === 'pending' ? 'Pendente' : 'Falhou'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
