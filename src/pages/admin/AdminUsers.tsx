
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Edit, Trash, Search, Users, RefreshCw, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { UserDetails } from "@/components/admin/UserDetails";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { useAdminAgents } from "@/hooks/admin/useAdminAgents";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { users, isLoading, error, fetchUsers } = useAdminUsers();
  const { agents } = useAdminAgents();

  // Apply search only when button is clicked or Enter is pressed
  const filteredUsers = users.filter(user => 
    searchApplied ? (
      user.email?.toLowerCase().includes(searchApplied.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchApplied.toLowerCase())
    ) : true
  );

  // Group agents by user ID
  const agentsByUser = React.useMemo(() => {
    const grouped: Record<string, number> = {};
    agents.forEach(agent => {
      if (agent.userId) {
        if (!grouped[agent.userId]) {
          grouped[agent.userId] = 0;
        }
        grouped[agent.userId]++;
      }
    });
    return grouped;
  }, [agents]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchUsers();
    setSearchApplied("");
    setSearchTerm("");
  };
  
  // Handle search
  const handleSearch = () => {
    setSearchApplied(searchTerm);
  };

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                </DialogHeader>
                <CreateUserForm onSuccess={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar usuários por email ou ID..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <Button onClick={handleSearch} type="button">
            Buscar
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {error.message}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Tentar novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !error && (
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
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      {users.length === 0 ? "Nenhum usuário encontrado" : "Nenhum resultado para a busca"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
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
                            {selectedUserId && <UserDetails userId={selectedUserId} />}
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
