
import React, { useState } from "react";
import { AdminUsers } from "./AdminUsers";
import { EditAdminCredentials } from "./EditAdminCredentials";
import { CreateAdminForm } from "./CreateAdminForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminUserManagement() {
  const [selectedTab, setSelectedTab] = useState<string>("list");
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  
  const handleEditAdmin = (adminId: string) => {
    setSelectedAdminId(adminId);
    setSelectedTab("edit");
  };
  
  const handleAdminCreated = () => {
    setSelectedTab("list");
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Gerenciamento de Administradores</CardTitle>
        <Shield className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Lista de Admins</TabsTrigger>
            <TabsTrigger value="edit" disabled={!selectedAdminId}>Editar Admin</TabsTrigger>
            <TabsTrigger value="create">Novo Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <AdminUsers onEditAdmin={handleEditAdmin} />
          </TabsContent>
          
          <TabsContent value="edit">
            {selectedAdminId && (
              <EditAdminCredentials 
                adminId={selectedAdminId}
                onDone={() => {
                  setSelectedAdminId(null);
                  setSelectedTab("list");
                }}
              />
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <CreateAdminForm 
              onSuccess={handleAdminCreated} 
              enablePrivilegeSelection={true} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
