
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DashboardMetrics {
  totalUsers: number;
  newUsers: number;
  totalAgents: number;
  activeSubscriptions: number;
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
    newUsers: 0,
    totalAgents: 0,
    activeSubscriptions: 0
  });
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const fetchDashboardMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching dashboard metrics...');
      
      // Get total users count from auth.users using a RPC function
      const { data: { count: totalUsers }, error: usersCountError } = await supabase
        .rpc('admin_count_total_users');
        
      if (usersCountError) {
        console.error('Error fetching total users:', usersCountError);
        // Fallback to user_plans table
        const { count: fallbackUserCount, error: fallbackError } = await supabase
          .from('user_plans')
          .select('*', { count: 'exact', head: true });
          
        if (fallbackError) throw fallbackError;
        
        console.log('Using fallback user count:', fallbackUserCount);
        metrics.totalUsers = fallbackUserCount || 0;
      } else {
        console.log('Total users from RPC:', totalUsers);
        metrics.totalUsers = totalUsers || 0;
      }
      
      // Get new users in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newUsers, error: newUsersError } = await supabase
        .from('user_plans')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());
        
      if (newUsersError) {
        console.error('Error fetching new users:', newUsersError);
        metrics.newUsers = 0;
      } else {
        console.log('New users count:', newUsers);
        metrics.newUsers = newUsers || 0;
      }
      
      // Get total agents - direct query to agents table
      const { count: totalAgents, error: agentsError } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true });
        
      if (agentsError) {
        console.error('Error fetching total agents:', agentsError);
        metrics.totalAgents = 0;
      } else {
        console.log('Total agents count:', totalAgents);
        metrics.totalAgents = totalAgents || 0;
      }
      
      // Get active subscriptions
      const { count: activeSubscriptions, error: subscriptionsError } = await supabase
        .from('user_plans')
        .select('*', { count: 'exact', head: true })
        .gt('plan', 0)
        .eq('payment_status', 'completed');
        
      if (subscriptionsError) {
        console.error('Error fetching active subscriptions:', subscriptionsError);
        metrics.activeSubscriptions = 0;
      } else {
        console.log('Active subscriptions count:', activeSubscriptions);
        metrics.activeSubscriptions = activeSubscriptions || 0;
      }
      
      setMetrics({...metrics});
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast.error('Erro ao carregar métricas do dashboard');
    } finally {
      setIsLoading(false);
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
  
  const loadMoreActivities = () => {
    if (hasMoreActivities) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchActivities(nextPage);
    }
  };
  
  const refreshData = useCallback(() => {
    console.log('Refreshing dashboard data...');
    fetchDashboardMetrics();
    fetchActivities(1);
    setPage(1);
  }, [fetchDashboardMetrics, fetchActivities]);
  
  const changeTimeFilter = (filter: 'today' | 'week' | 'month' | 'all') => {
    console.log('Changing time filter to:', filter);
    setTimeFilter(filter);
    setPage(1);
    fetchActivities(1, filter);
  };
  
  // Export data as CSV
  const exportAsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "ID,Tipo,Descrição,Data,Usuário\n";
    
    // Add activities data
    activities.forEach(activity => {
      csvContent += `${activity.id},${activity.type},"${activity.description}",${activity.created_at},${activity.user_email || activity.user_id || "N/A"}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `atividades_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
  };
  
  // Initial data loading
  useEffect(() => {
    console.log('Initial loading of dashboard metrics and activities');
    fetchDashboardMetrics();
    fetchActivities();
    
    // Setup polling for automatic updates
    const pollingInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard data');
      fetchDashboardMetrics();
      fetchActivities(1);
      setPage(1);
    }, 60000); // 60 seconds
    
    return () => clearInterval(pollingInterval);
  }, [fetchDashboardMetrics, fetchActivities]);
  
  return {
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
  };
}
