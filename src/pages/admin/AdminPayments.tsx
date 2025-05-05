import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PaymentRegistrationForm } from "@/components/admin/payments/PaymentRegistrationForm";
import { RecentPaymentsTable } from "@/components/admin/payments/RecentPaymentsTable";
import { PaymentHistorySearch } from "@/components/admin/payments/PaymentHistorySearch";

export default function AdminPayments() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Gerenciar Pagamentos</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <PaymentRegistrationForm />
          <RecentPaymentsTable />
        </div>
        
        <PaymentHistorySearch />
      </div>
    </AdminLayout>
  );
}
