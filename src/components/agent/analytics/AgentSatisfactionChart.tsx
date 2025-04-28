
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface SatisfactionData {
  date: string;
  score: number;
}

interface AgentSatisfactionChartProps {
  data: SatisfactionData[];
}

export const AgentSatisfactionChart = ({ data }: AgentSatisfactionChartProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de Satisfação</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            score: {
              label: "Pontuação",
              color: "hsl(25, 95%, 53%)"
            }
          }}
          className="aspect-[4/3]"
        >
          <LineChart data={chartData}>
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              domain={[0, 5]} 
              ticks={[0, 1, 2, 3, 4, 5]} 
            />
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="var(--color-score)" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }} 
            />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
