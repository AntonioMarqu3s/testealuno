
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Edit, Trash, Users } from "lucide-react";
import { UserDetails } from "@/components/admin/UserDetails";
import { UserPlan } from "@/hooks/admin/useAdminUsers";

interface UserRowProps {
  user: {
    id: string;
    email: string;
    created_at: string;
    isActive: boolean;
    plan?: UserPlan;
  };
  agentsByUser: Record<string, number>;
  setSelectedUserId: (id: string | null) => void;
  formatDate: (dateString: string | null | undefined) => string;
}

export function UserTableRow({ user, agentsByUser, setSelectedUserId, formatDate }: UserRowProps) {
  // Helper function to get plan badge variant based on plan type
  const getPlanBadgeVariant = (planType?: number) => {
    switch(planType) {
      case 0: return "outline"; // Free Trial
      case 1: return "secondary"; // Básico
      case 2: return "default"; // Standard
      case 3: return "destructive"; // Premium
      default: return "outline";
    }
  };
  
  // Helper function to format plan name
  const getPlanDisplayName = (plan?: UserPlan) => {
    if (!plan) return "N/A";
    return plan.name || (
      plan.plan === 0 ? "Teste Gratuito" : 
      plan.plan === 1 ? "Básico" :
      plan.plan === 2 ? "Standard" :
      plan.plan === 3 ? "Premium" : "Desconhecido"
    );
  };
  
  // Helper function to get payment status badge styles
  const getPaymentStatusBadge = (status?: string) => {
    if (!status) return { className: "bg-gray-100 text-gray-800", text: "N/A" };
    
    switch(status.toLowerCase()) {
      case 'completed':
        return { className: "bg-green-100 text-green-800", text: "Pago" };
      case 'pending':
        return { className: "bg-yellow-100 text-yellow-800", text: "Pendente" };
      case 'failed':
        return { className: "bg-red-100 text-red-800", text: "Falhou" };
      default:
        return { className: "bg-gray-100 text-gray-800", text: status };
    }
  };

  const paymentStatus = getPaymentStatusBadge(user.plan?.payment_status);

  return (
    <TableRow key={user.id}>
      <TableCell className="font-mono text-xs">{user.id.substring(0, 8)}...</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {user.plan ? (
          <Badge variant={getPlanBadgeVariant(user.plan.plan)} className="bg-primary/10">
            {getPlanDisplayName(user.plan)}
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
          <span className={`px-2 py-1 rounded-full text-xs ${paymentStatus.className}`}>
            {paymentStatus.text}
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
