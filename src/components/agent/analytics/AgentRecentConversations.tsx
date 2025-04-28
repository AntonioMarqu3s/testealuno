
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  customer: string;
  time: string;
  duration: string;
  status: "completed" | "abandoned" | "converted";
}

interface AgentRecentConversationsProps {
  conversations: Conversation[];
}

export const AgentRecentConversations = ({ conversations }: AgentRecentConversationsProps) => {
  const getStatusBadge = (status: Conversation["status"]) => {
    switch (status) {
      case "converted":
        return <Badge variant="default">Convertido</Badge>;
      case "completed":
        return <Badge variant="secondary">Finalizado</Badge>;
      case "abandoned":
        return <Badge variant="outline">Abandonado</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.map((conversation) => (
              <TableRow key={conversation.id}>
                <TableCell className="font-medium">{conversation.customer}</TableCell>
                <TableCell>{conversation.time}</TableCell>
                <TableCell>{conversation.duration}</TableCell>
                <TableCell>{getStatusBadge(conversation.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
