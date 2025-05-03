
import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { useAdminAgents } from "@/hooks/admin/useAdminAgents";

// Import the new components
import { UserSearchBar } from "@/components/admin/users/UserSearchBar";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { ErrorAlert } from "@/components/admin/users/ErrorAlert";
import { CreateUserDialog } from "@/components/admin/users/CreateUserDialog";

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
            
            <CreateUserDialog 
              isOpen={isCreateDialogOpen} 
              setIsOpen={setIsCreateDialogOpen} 
            />
          </div>
        </div>

        <UserSearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          handleSearch={handleSearch} 
        />
        
        {error && (
          <ErrorAlert error={error} onRetry={handleRefresh} />
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !error && (
          <UsersTable 
            users={users}
            filteredUsers={filteredUsers}
            agentsByUser={agentsByUser}
            setSelectedUserId={setSelectedUserId}
            formatDate={formatDate}
          />
        )}
      </div>
    </AdminLayout>
  );
}
