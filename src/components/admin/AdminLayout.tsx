
import React from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AdminNavbar } from "./AdminNavbar";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, adminLogout } = useAdminAuth();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground mt-2">
            Você precisa estar logado como administrador para acessar essa página.
          </p>
          <a 
            href="/admin" 
            className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Ir para o login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/20">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminNavbar onLogout={adminLogout} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
