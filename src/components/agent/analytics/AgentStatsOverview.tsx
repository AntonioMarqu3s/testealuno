
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ThumbsUp, TrendingUp } from "lucide-react";

interface AgentStatsOverviewProps {
  conversations: number;
  conversionRate: number;
  satisfactionScore: number;
}

export const AgentStatsOverview = ({
  conversations,
  conversionRate,
  satisfactionScore
}: AgentStatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Conversas</p>
              <h3 className="text-3xl font-bold mt-1">{conversations}</h3>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
              <h3 className="text-3xl font-bold mt-1">{conversionRate}%</h3>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Satisfação do Cliente</p>
              <h3 className="text-3xl font-bold mt-1">{satisfactionScore}/5</h3>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ThumbsUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
