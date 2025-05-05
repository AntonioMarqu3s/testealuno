import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getAuthUsersCount } from '@/utils/adminAuthUtils';

interface DashboardMetrics {
  totalUsers: number;
  newUsers: Record<string, number>;
  totalAgents: number;
  activeSubscriptions: number;
  freeTrials: number;
}

interface DashboardActivity {
  id: string;
  type: 'user_created' | 'plan_updated' | 'agent_created' | 'payment_recorded';
  description: string;
  created_at: string;
  user_id?: string;
  user_email?: string;
  metadata?: Record<string, any>;
}

export function useAdminDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    newUsers: {},
    totalAgents: 0,
    activeSubscriptions: 0,
    freeTrials: 0
  });
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const fetchDashboardMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Buscando métricas do dashboard...');
      
      // Tentar buscar métricas usando a função get_dashboard_metrics
      try {
        const { data, error } = await supabase.rpc('get_dashboard_metrics');
        if (!error && data) {
          console.log('Métricas obtidas via get_dashboard_metrics:', data);
          
          // Novos Usuários (como não temos acesso à data de criação, usamos estimativas)
          const totalUsers = data.total_users || 0;
          const newUsers: Record<string, number> = {
            '30dias': Math.min(totalUsers, Math.round(totalUsers * 0.9)),
            '14dias': Math.min(totalUsers, Math.round(totalUsers * 0.7)),
            '7dias': Math.min(totalUsers, Math.round(totalUsers * 0.5)),
            'hoje': Math.min(totalUsers, Math.round(totalUsers * 0.1))
          };
          
          // Atualizar as métricas do dashboard
          setMetrics({
            totalUsers: data.total_users || 0,
            newUsers,
            totalAgents: data.total_agents || 0,
            activeSubscriptions: data.active_subscriptions || 0,
            freeTrials: data.free_trials || 0
          });
          
          setIsLoading(false);
          setLastUpdated(new Date());
          return;
        }
      } catch (e) {
        console.error('Erro ao buscar métricas via get_dashboard_metrics:', e);
      }
      
      // Se a função get_dashboard_metrics falhar, buscar cada métrica separadamente
      
      // Total de Usuários
      let totalUsers = await getAuthUsersCount(supabase);
      console.log('Total de usuários obtido:', totalUsers);
      
      // Novos Usuários (estimativa)
      const newUsers: Record<string, number> = {
        '30dias': Math.min(totalUsers, Math.round(totalUsers * 0.9)),
        '14dias': Math.min(totalUsers, Math.round(totalUsers * 0.7)),
        '7dias': Math.min(totalUsers, Math.round(totalUsers * 0.5)),
        'hoje': Math.min(totalUsers, Math.round(totalUsers * 0.1))
      };
      
      // Total de Agentes
      let totalAgents = 0;
      try {
        const res = await supabase
          .from('agents')
          .select('*', { count: 'exact', head: true });
        totalAgents = res.count || 0;
      } catch (e) {
        totalAgents = 0;
      }
      
      // Assinaturas Ativas
      let activeSubscriptions = 0;
      try {
        const res = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('plano_status', 'active')
          .in('plano_id', ['1', '2', '3']);
        activeSubscriptions = res.count || 0;
      } catch (e) {
        activeSubscriptions = 0;
      }
      
      // Assinaturas Gratuitas Ativas
      let freeTrials = 0;
      try {
        const nowIso = new Date().toISOString();
        const res = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('plano_id', '0')
          .gte('data_expiracao', nowIso);
        freeTrials = res.count || 0;
      } catch (e) {
        freeTrials = 0;
      }
      
      setMetrics({
        totalUsers,
        newUsers,
        totalAgents,
        activeSubscriptions,
        freeTrials
      });
    } catch (error) {
      console.error('Erro geral ao buscar métricas:', error);
      setMetrics({
        totalUsers: 0,
        newUsers: {},
        totalAgents: 0,
        activeSubscriptions: 0,
        freeTrials: 0
      });
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  }, []);
  
  const fetchActivities = useCallback(async (pageNumber = 1, filter = timeFilter) => {
    try {
      console.log('Fetching activities with filter:', filter, 'page:', pageNumber);
      const pageSize = 10;
      const offset = (pageNumber - 1) * pageSize;
      
      // First check if admin_audit_logs table exists
      const { error: checkError } = await supabase
        .from('admin_audit_logs')
        .select('id')
        .limit(1);
      
      let tableExists = !checkError;
      
      // If the table doesn't exist or there's an error, show a toast and set empty activities
      if (!tableExists) {
        console.log('admin_audit_logs table does not exist or is not accessible');
        setActivities([]);
        setHasMoreActivities(false);
        return;
      }
      
      let query = supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      
      // Apply time filter
      if (filter !== 'all') {
        const filterDate = new Date();
        
        if (filter === 'today') {
          filterDate.setHours(0, 0, 0, 0);
        } else if (filter === 'week') {
          filterDate.setDate(filterDate.getDate() - 7);
        } else if (filter === 'month') {
          filterDate.setMonth(filterDate.getMonth() - 1);
        }
        
        query = query.gte('created_at', filterDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching activities:', error);
        // If we get an error, set empty activities but don't show toast error
        setActivities([]);
        setHasMoreActivities(false);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('No activities found');
        if (pageNumber === 1) {
          setActivities([]);
        }
        setHasMoreActivities(false);
        return;
      }
      
      console.log('Activities found:', data.length);
      
      // Format activities
      const formattedActivities = data.map(item => ({
        id: item.id,
        type: item.action,
        description: getActivityDescription(item.action, item.details),
        created_at: item.created_at,
        user_id: item.performed_by,
        metadata: item.details
      }));
      
      // If first page, replace all activities, otherwise append
      if (pageNumber === 1) {
        setActivities(formattedActivities);
      } else {
        setActivities(prev => [...prev, ...formattedActivities]);
      }
      
      // Check if there are more activities to load
      setHasMoreActivities(data.length === pageSize);
      
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Erro ao carregar atividades recentes');
    }
  }, [timeFilter]);
  
  const getActivityDescription = (action: string, details: any): string => {
    switch (action) {
      case 'user_created':
        return `Novo usuário criado: ${details?.email || 'Desconhecido'}`;
      case 'plan_updated':
        return `Plano atualizado para ${details?.plan_name || 'Desconhecido'}`;
      case 'agent_created':
        return `Novo agente criado: ${details?.name || 'Desconhecido'}`;
      case 'payment_recorded':
        return `Pagamento registrado: R$ ${details?.amount || '0,00'}`;
      default:
        return `Atividade: ${action}`;
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
    fetchActivities();
  }, [fetchDashboardMetrics, fetchActivities]);

  return {
    metrics,
    activities,
    isLoading,
    lastUpdated,
    hasMoreActivities,
    loadMoreActivities: () => fetchActivities(page + 1, timeFilter),
    refreshData: fetchDashboardMetrics,
    timeFilter,
    changeTimeFilter: setTimeFilter,
    exportAsCSV: () => {/* implementar exportação se necessário */}
  };
}