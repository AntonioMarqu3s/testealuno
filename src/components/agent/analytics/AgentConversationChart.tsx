
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface ConversationData {
  date: string;
  conversations: number;
  conversions: number;
}

interface AgentConversationChartProps {
  data: ConversationData[];
}

export const AgentConversationChart = ({ data }: AgentConversationChartProps) => {
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
        <CardTitle>Conversas e Conversões</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            conversations: {
              label: "Conversas",
              color: "hsl(215, 100%, 50%)"
            },
            conversions: {
              label: "Conversões",
              color: "hsl(142, 71%, 45%)"
            }
          }}
          className="aspect-[4/3]"
        >
          <BarChart data={chartData}>
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <Bar dataKey="conversations" fill="var(--color-conversations)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="conversions" fill="var(--color-conversions)" radius={[4, 4, 0, 0]} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
