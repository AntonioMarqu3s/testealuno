
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
import { Search, Edit, Trash, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminAgents } from "@/hooks/admin/useAdminAgents";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AgentDetails } from "@/components/admin/AgentDetails";

export default function AdminAgents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const { agents, isLoading, error } = useAdminAgents();
  
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Agentes</h1>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar agentes por nome, ID ou email do usuário..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Erro ao carregar agentes: {error.message}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Nenhum agente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell className="font-mono text-xs">{agent.id.substring(0, 8)}...</TableCell>
                      <TableCell>{agent.type}</TableCell>
                      <TableCell>{agent.userEmail || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={agent.isConnected ? "success" : "outline"}>
                          {agent.isConnected ? "Conectado" : "Desconectado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedAgentId(agent.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Agente</DialogTitle>
                            </DialogHeader>
                            {selectedAgentId && <AgentDetails agentId={selectedAgentId} />}
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
