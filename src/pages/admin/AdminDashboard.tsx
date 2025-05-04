
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DashboardMetricCard } from "@/components/admin/dashboard/DashboardMetricCard";
import { ActivityFeed } from "@/components/admin/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Bot, Calendar } from "lucide-react";
import { useAdminDashboardMetrics } from "@/hooks/admin/useAdminDashboardMetrics";
import { AdminQuickAction } from "@/components/admin/dashboard/AdminQuickAction";

export default function AdminDashboard() {
  const {
    metrics,
    activities,
    isLoading,
    lastUpdated,
    hasMoreActivities,
    loadMoreActivities,
    refreshData,
    timeFilter,
    changeTimeFilter,
    exportAsCSV
  } = useAdminDashboardMetrics();
  
  const [previousMetrics, setPreviousMetrics] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalAgents: 0,
    activeSubscriptions: 0
  });
  
  // Save previous metrics for animation comparison
  useEffect(() => {
    if (!isLoading) {
      setPreviousMetrics(metrics);
    }
  }, [metrics, isLoading]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardMetricCard
            title="Total de Usuários"
            value={metrics.totalUsers}
            icon={<Users className="h-6 w-6" />}
            description="Usuários registrados"
            colorClass="bg-blue-100 text-blue-700"
            isLoading={isLoading}
            previousValue={previousMetrics.totalUsers}
          />
          
          <DashboardMetricCard
            title="Novos Usuários"
            value={metrics.newUsers}
            icon={<UserPlus className="h-6 w-6" />}
            description="Últimos 30 dias"
            colorClass="bg-green-100 text-green-700"
            isLoading={isLoading}
            previousValue={previousMetrics.newUsers}
          />
          
          <DashboardMetricCard
            title="Total de Agentes"
            value={metrics.totalAgents}
            icon={<Bot className="h-6 w-6" />}
            description="Agentes criados"
            colorClass="bg-purple-100 text-purple-700"
            isLoading={isLoading}
            previousValue={previousMetrics.totalAgents}
          />
          
          <DashboardMetricCard
            title="Assinaturas Ativas"
            value={metrics.activeSubscriptions}
            icon={<Calendar className="h-6 w-6" />}
            description="Planos pagos"
            colorClass="bg-amber-100 text-amber-700"
            isLoading={isLoading}
            previousValue={previousMetrics.activeSubscriptions}
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
          
          <ActivityFeed 
            activities={activities}
            isLoading={isLoading}
            lastUpdated={lastUpdated}
            hasMore={hasMoreActivities}
            onLoadMore={loadMoreActivities}
            onRefresh={refreshData}
            timeFilter={timeFilter}
            onChangeTimeFilter={changeTimeFilter}
            onExport={exportAsCSV}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
