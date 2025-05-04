
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Types used in the Admin System
 */
export type AdminRole = 'master' | 'group';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  total_users: number;
  total_admins: number;
}

export interface GroupUser {
  user_id: string;
  email: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  groups?: Group[];
  created_at: string;
}

/**
 * Admin System Documentation Component
 */
export default function AdminDocumentation() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Sistema Administrativo - Documentação</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="roles">Funções</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="database">Estrutura do Banco</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold">Introdução</h3>
                <p className="mt-2 text-muted-foreground">
                  O sistema administrativo permite gerenciar todos os aspectos da plataforma Agente Conecta, 
                  incluindo usuários, administradores, planos, pagamentos e configurações globais.
                </p>
              </section>
              
              <section>
                <h3 className="text-lg font-semibold">Componentes Principais</h3>
                <ul className="list-disc ml-6 mt-2 space-y-2">
                  <li><strong>Painel de Controle:</strong> Visão geral de métricas e atividades</li>
                  <li><strong>Gerenciamento de Usuários:</strong> Criar, visualizar e gerenciar contas de usuários</li>
                  <li><strong>Gerenciamento de Planos:</strong> Configurar e atribuir planos de assinatura</li>
                  <li><strong>Pagamentos:</strong> Acompanhar e processar pagamentos</li>
                  <li><strong>Administradores:</strong> Gerenciar contas administrativas e permissões</li>
                  <li><strong>Grupos:</strong> Organizar usuários e gerenciar permissões em massa</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Funções Administrativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold">Tipos de Administradores</h3>
                <div className="mt-4 space-y-4">
                  <div className="p-4 rounded-md border bg-background">
                    <h4 className="font-medium">Administrador Master</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Possui acesso completo a todas as funcionalidades do sistema, incluindo a capacidade de criar
                      outros administradores e definir configurações globais do sistema.
                    </p>
                    <div className="mt-2">
                      <code className="text-xs bg-muted p-1 rounded">role: 'master'</code>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md border bg-background">
                    <h4 className="font-medium">Administrador de Grupo</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Possui acesso limitado a gerenciar usuários e configurações dentro de grupos específicos
                      aos quais foi atribuído.
                    </p>
                    <div className="mt-2">
                      <code className="text-xs bg-muted p-1 rounded">role: 'group'</code>
                    </div>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissões por Função</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Funcionalidade</th>
                      <th className="text-center p-2">Master Admin</th>
                      <th className="text-center p-2">Group Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Dashboard</td>
                      <td className="text-center p-2">✓</td>
                      <td className="text-center p-2">✓</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Ver usuários</td>
                      <td className="text-center p-2">✓</td>
                      <td className="text-center p-2">Somente no grupo</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Criar usuários</td>
                      <td className="text-center p-2">✓</td>
                      <td className="text-center p-2">Somente no grupo</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Ver administradores</td>
                      <td className="text-center p-2">✓</td>
                      <td className="text-center p-2">✗</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Criar administradores</td>
                      <td className="text-center p-2">✓</td>
                      <td className="text-center p-2">✗</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Gerenciar planos</td>
                      <td className="text-center p-2">✓</td>
                      <td className="text-center p-2">✗</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Gerenciar pagamentos</td>
                      <td className="text-center p-2">✓</td>
                      <td className="text-center p-2">✗</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Criar grupos</td>
                      <td className="text-center p-2">✓</td>
                      <td className="text-center p-2">✗</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Configurações do sistema</td>
                      <td className="text-center p-2">✓</td>
                      <td className="text-center p-2">✗</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Estrutura do Banco de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold">Tabelas Principais</h3>
                <div className="mt-4 space-y-4">
                  <div className="p-4 rounded-md border bg-background">
                    <h4 className="font-medium">admin_users</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Armazena informações sobre os administradores do sistema.
                    </p>
                    <div className="mt-2 text-sm">
                      <pre className="bg-muted p-2 rounded overflow-x-auto">
{`CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role admin_role_type NOT NULL DEFAULT 'group',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md border bg-background">
                    <h4 className="font-medium">groups</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Define grupos para organizar usuários e administradores.
                    </p>
                    <div className="mt-2 text-sm">
                      <pre className="bg-muted p-2 rounded overflow-x-auto">
{`CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md border bg-background">
                    <h4 className="font-medium">group_users</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Relacionamento entre grupos e usuários.
                    </p>
                    <div className="mt-2 text-sm">
                      <pre className="bg-muted p-2 rounded overflow-x-auto">
{`CREATE TABLE public.group_users (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md border bg-background">
                    <h4 className="font-medium">group_admins</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Relacionamento entre grupos e administradores.
                    </p>
                    <div className="mt-2 text-sm">
                      <pre className="bg-muted p-2 rounded overflow-x-auto">
{`CREATE TABLE public.group_admins (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, admin_id)
);`}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
