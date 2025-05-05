
import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Settings, Calendar } from "lucide-react";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total de Usuários"
            value="--"
            icon={<Users className="h-6 w-6" />}
            description="Usuários registrados"
            colorClass="bg-blue-100 text-blue-700"
          />
          
          <DashboardCard
            title="Novos Usuários"
            value="--"
            icon={<UserPlus className="h-6 w-6" />}
            description="Últimos 30 dias"
            colorClass="bg-green-100 text-green-700"
          />
          
          <DashboardCard
            title="Total de Agentes"
            value="--"
            icon={<Settings className="h-6 w-6" />}
            description="Agentes criados"
            colorClass="bg-purple-100 text-purple-700"
          />
          
          <DashboardCard
            title="Assinaturas Ativas"
            value="--"
            icon={<Calendar className="h-6 w-6" />}
            description="Planos pagos"
            colorClass="bg-amber-100 text-amber-700"
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AdminQuickAction
                label="Gerenciar Usuários"
                description="Ver, editar e criar usuários"
                href="/admin/users"
              />
              
              <AdminQuickAction
                label="Gerenciar Agentes"
                description="Ver e editar agentes dos usuários"
                href="/admin/agents"
              />
              
              <AdminQuickAction
                label="Gerenciar Planos"
                description="Modificar planos e limites"
                href="/admin/plans"
              />
              
              <AdminQuickAction
                label="Registrar Pagamentos"
                description="Registrar pagamentos e datas"
                href="/admin/payments"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Dados de atividade serão exibidos aqui
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  colorClass: string;
}

function DashboardCard({ title, value, icon, description, colorClass }: DashboardCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AdminQuickActionProps {
  label: string;
  description: string;
  href: string;
}

function AdminQuickAction({ label, description, href }: AdminQuickActionProps) {
  return (
    <a 
      href={href} 
      className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
    >
      <div className="font-medium">{label}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </a>
  );
}
