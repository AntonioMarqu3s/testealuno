
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download,
  RefreshCw,
  Filter,
  User,
  CreditCard,
  Bot,
  Calendar,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  user_id?: string;
  user_email?: string;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: Activity[];
  isLoading: boolean;
  lastUpdated: Date;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  timeFilter: 'today' | 'week' | 'month' | 'all';
  onChangeTimeFilter: (filter: 'today' | 'week' | 'month' | 'all') => void;
  onExport: () => void;
}

export function ActivityFeed({
  activities,
  isLoading,
  lastUpdated,
  hasMore,
  onLoadMore,
  onRefresh,
  timeFilter,
  onChangeTimeFilter,
  onExport
}: ActivityFeedProps) {
  // Function to determine icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created':
        return <User className="h-4 w-4" />;
      case 'plan_updated':
        return <Calendar className="h-4 w-4" />;
      case 'agent_created':
        return <Bot className="h-4 w-4" />;
      case 'payment_recorded':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Function to determine badge style based on activity type
  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case 'user_created':
        return 'default';
      case 'plan_updated':
        return 'secondary';
      case 'agent_created':
        return 'outline';
      case 'payment_recorded':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Format the timestamp
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "dd MMM, HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };
  
  // Get filter title
  const getFilterTitle = () => {
    switch (timeFilter) {
      case 'today':
        return 'Hoje';
      case 'week':
        return 'Esta semana';
      case 'month':
        return 'Este mês';
      default:
        return 'Todos';
    }
  };

  return (
    <Card className="col-span-full md:col-span-1 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{getFilterTitle()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onChangeTimeFilter('today')}>
                Hoje
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeTimeFilter('week')}>
                Esta semana
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeTimeFilter('month')}>
                Este mês
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeTimeFilter('all')}>
                Todos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-xs text-muted-foreground mb-4">
          Última atualização: {format(lastUpdated, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
        </div>

        {isLoading && activities.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma atividade encontrada
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 animate-fadeIn pb-4 border-b border-border"
                >
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{activity.description}</p>
                      <Badge variant={getActivityBadgeVariant(activity.type)} className="shrink-0">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(activity.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="pt-2 text-center">
                  <Button variant="outline" size="sm" onClick={onLoadMore}>
                    Carregar mais
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
