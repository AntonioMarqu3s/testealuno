'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { Admin, Group } from "@/types/admin";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface GroupFormData {
  name: string;
  description: string;
  admin_id: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [admins, setAdmins] = React.useState<Admin[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const form = useForm<GroupFormData>();

  // Carregar grupos e admins
  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      
      // Carregar admins de grupo
      const { data: adminsData, error: adminsError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('level', 'group');
      
      if (adminsError) throw adminsError;
      setAdmins(adminsData);

      // Carregar grupos
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`
          *,
          admin:admin_id (
            name,
            email
          )
        `);

      if (groupsError) throw groupsError;
      setGroups(groupsData);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(data: GroupFormData) {
    try {
      const { error } = await supabase
        .from('groups')
        .insert({
          name: data.name,
          description: data.description,
          admin_id: data.admin_id
        });

      if (error) throw error;

      toast.success('Grupo criado com sucesso');
      form.reset();
      loadData();
    } catch (err) {
      console.error('Erro ao criar grupo:', err);
      toast.error('Erro ao criar grupo');
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Grupos</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Criar Novo Grupo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Crie um novo grupo e atribua um administrador
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Grupo</label>
                <Input
                  placeholder="Digite o nome do grupo"
                  {...form.register("name", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Digite uma descrição para o grupo"
                  {...form.register("description", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Administrador do Grupo</label>
                <Select onValueChange={(value) => form.setValue("admin_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um administrador" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name} ({admin.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Criar Grupo
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Grupos Existentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Lista de grupos criados no sistema
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : groups.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum grupo criado
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <div key={group.id} className="flex flex-col gap-2 p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{group.name}</h3>
                        <Badge variant="outline">
                          {(group.admin as { name: string })?.name || 'Sem admin'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 