
import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PaymentRegistrationForm } from "@/components/admin/payments/PaymentRegistrationForm";
import { RecentPaymentsTable } from "@/components/admin/payments/RecentPaymentsTable";
import { PaymentHistorySearch } from "@/components/admin/payments/PaymentHistorySearch";
import { Payment } from "@/components/admin/payments/types";

export default function AdminPayments() {
  // Mock payment data for the table
  const recentPayments: Payment[] = [
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

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Gerenciar Pagamentos</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <PaymentRegistrationForm />
          <RecentPaymentsTable payments={recentPayments} />
        </div>
        
        <PaymentHistorySearch />
      </div>
    </AdminLayout>
  );
}
