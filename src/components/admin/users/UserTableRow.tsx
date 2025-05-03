
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Edit, Trash, Users } from "lucide-react";
import { UserDetails } from "@/components/admin/UserDetails";

interface UserRowProps {
  user: {
    id: string;
    email: string;
    created_at: string;
    isActive: boolean;
    plan?: {
      name: string;
      agent_limit: number;
      plan: number;
      payment_date?: string;
      subscription_ends_at?: string;
      payment_status?: string;
      trial_ends_at?: string;
    };
  };
  agentsByUser: Record<string, number>;
  setSelectedUserId: (id: string | null) => void;
  formatDate: (dateString: string | null | undefined) => string;
}

export function UserTableRow({ user, agentsByUser, setSelectedUserId, formatDate }: UserRowProps) {
  return (
    <TableRow key={user.id}>
      <TableCell className="font-mono text-xs">{user.id.substring(0, 8)}...</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {user.plan ? (
          <Badge variant="outline" className="bg-primary/10">
            {user.plan.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        )}
      </TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {user.isActive ? "Ativo" : "Inativo"}
        </span>
      </TableCell>
      <TableCell>
        {user.plan?.payment_status ? (
          <span className={`px-2 py-1 rounded-full text-xs ${
            user.plan.payment_status === 'completed' ? "bg-green-100 text-green-800" : 
            user.plan.payment_status === 'pending' ? "bg-yellow-100 text-yellow-800" : 
            "bg-gray-100 text-gray-800"
          }`}>
            {user.plan.payment_status === 'completed' ? "Pago" : 
              user.plan.payment_status === 'pending' ? "Pendente" : 
              user.plan.payment_status}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        )}
      </TableCell>
      <TableCell>
        {user.plan?.subscription_ends_at ? (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="text-xs">{formatDate(user.plan.subscription_ends_at)}</span>
          </div>
        ) : user.plan?.trial_ends_at ? (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-amber-500" />
            <span className="text-xs text-amber-600">Trial: {formatDate(user.plan.trial_ends_at)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        )}
      </TableCell>
      <TableCell>
        {agentsByUser[user.id] ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {agentsByUser[user.id]}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">Nenhum</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedUserId(user.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
            </DialogHeader>
            <UserDetails userId={user.id} />
          </DialogContent>
        </Dialog>
        
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
          <Trash className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
