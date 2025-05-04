'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { Admin, AdminLevel } from "@/types/admin";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AdminFormData {
  name: string;
  email: string;
  level: AdminLevel;
}

export default function AdministratorsPage() {
  const [admins, setAdmins] = React.useState<Admin[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const form = useForm<AdminFormData>();

  // Carregar administradores
  React.useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data);
    } catch (err) {
      console.error('Erro ao carregar administradores:', err);
      toast.error('Erro ao carregar administradores');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(data: AdminFormData) {
    try {
      // Verificar se o email já existe
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existingAdmin) {
        toast.error('Este email já está cadastrado');
        return;
      }

      const { error } = await supabase
        .from('admin_users')
        .insert({
          name: data.name,
          email: data.email,
          level: data.level
        });

      if (error) throw error;

      toast.success('Administrador criado com sucesso');
      form.reset();
      loadAdmins();
    } catch (err) {
      console.error('Erro ao criar administrador:', err);
      toast.error('Erro ao criar administrador');
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Administradores</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Criar Novo Administrador</CardTitle>
            <p className="text-sm text-muted-foreground">
              Adicione um novo administrador ao sistema
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  placeholder="Digite o nome do administrador"
                  {...form.register("name", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="Digite o email do administrador"
                  {...form.register("email", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nível de Acesso</label>
                <Select onValueChange={(value: AdminLevel) => form.setValue("level", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="master">Administrador Master</SelectItem>
                    <SelectItem value="group">Administrador de Grupo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Criar Administrador
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Administradores Cadastrados</CardTitle>
            <p className="text-sm text-muted-foreground">
              Lista de todos os administradores do sistema
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : admins.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum administrador cadastrado
                </div>
              ) : (
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex flex-col gap-2 p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{admin.name}</h3>
                        <Badge variant={admin.level === 'master' ? 'default' : 'secondary'}>
                          {admin.level === 'master' ? 'Master' : 'Grupo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
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