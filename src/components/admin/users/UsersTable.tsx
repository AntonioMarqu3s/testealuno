
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { NoUsersFound } from "./NoUsersFound";
import { UserTableRow } from "./UserTableRow";

interface UsersTableProps {
  users: Array<{
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
  }>;
  filteredUsers: Array<any>;
  agentsByUser: Record<string, number>;
  setSelectedUserId: (id: string | null) => void;
  formatDate: (dateString: string | null | undefined) => string;
}

export function UsersTable({ 
  users, 
  filteredUsers, 
  agentsByUser, 
  setSelectedUserId,
  formatDate 
}: UsersTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Expiração</TableHead>
            <TableHead>Agentes</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <NoUsersFound usersExist={users.length > 0} />
          ) : (
            filteredUsers.map((user) => (
              <UserTableRow 
                key={user.id}
                user={user} 
                agentsByUser={agentsByUser} 
                setSelectedUserId={setSelectedUserId}
                formatDate={formatDate}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
