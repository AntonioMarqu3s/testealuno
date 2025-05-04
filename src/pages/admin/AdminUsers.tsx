import React, { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { useAdminAgents } from "@/hooks/admin/useAdminAgents";

// Import the components
import { UserSearchBar } from "@/components/admin/users/UserSearchBar";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { ErrorAlert } from "@/components/admin/users/ErrorAlert";
import { CreateUserDialog } from "@/components/admin/users/CreateUserDialog";
import { UserDetailDrawer } from "@/components/admin/users/UserDetailDrawer";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const { users, isLoading, error, fetchUsers } = useAdminUsers();
  const { agents } = useAdminAgents();

  // Enhanced filter function to search through different user fields
  const filteredUsers = useMemo(() => {
    if (!searchApplied) return users;
    
    const searchLower = searchApplied.toLowerCase();
    return users.filter(user => 
      // Search by email
      user.email?.toLowerCase().includes(searchLower) ||
      // Search by ID
      user.id?.toLowerCase().includes(searchLower) ||
      // Search by plan name
      user.plan?.name?.toLowerCase().includes(searchLower) ||
      // Search by payment status
      user.plan?.payment_status?.toLowerCase().includes(searchLower) ||
      // Search in metadata (name)
      user.metadata?.name?.toLowerCase().includes(searchLower) ||
      // Search by whether user is active or inactive
      (searchLower === "ativo" && user.isActive) ||
      (searchLower === "inativo" && !user.isActive)
    );
  }, [users, searchApplied]);

  // Group agents by user ID
  const agentsByUser = useMemo(() => {
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

  // Handle opening user detail drawer
  const handleUserClick = (userId: string) => {
    console.log("Opening user details for:", userId);
    setSelectedUserId(userId);
    setIsDetailDrawerOpen(true);
  };

  // Handle closing user detail drawer
  const handleCloseDrawer = () => {
    setSelectedUserId(null);
    setIsDetailDrawerOpen(false);
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
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Adicionar Usuário
            </Button>
            
            <CreateUserDialog 
              isOpen={isCreateDialogOpen} 
              setIsOpen={setIsCreateDialogOpen} 
              onSuccess={handleRefresh}
            />
          </div>
        </div>

        <UserSearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          handleSearch={handleSearch} 
          placeholderText="Buscar por email, plano, status..."
        />
        
        {error && (
          <ErrorAlert error={error} onRetry={handleRefresh} />
        )}
        
        <div className="text-sm text-muted-foreground">
          {searchApplied ? 
            `${filteredUsers.length} usuário(s) encontrado(s) para "${searchApplied}"` : 
            `Mostrando ${users.length} usuário(s)`
          }
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !error && (
          <UsersTable 
            users={users}
            filteredUsers={filteredUsers}
            agentsByUser={agentsByUser}
            setSelectedUserId={handleUserClick}
            formatDate={formatDate}
          />
        )}
        
        <UserDetailDrawer 
          userId={selectedUserId}
          open={isDetailDrawerOpen}
          onClose={handleCloseDrawer}
          onUserUpdated={handleRefresh}
        />
      </div>
    </AdminLayout>
  );
}
