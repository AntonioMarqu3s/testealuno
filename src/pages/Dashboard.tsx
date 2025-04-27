
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentGrid } from "@/components/dashboard/AgentGrid";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Users } from "lucide-react";

const Dashboard = () => {
  return (
    <MainLayout title="Dashboard">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo ao Agent Hub</h2>
            <p className="text-muted-foreground">
              Crie e personalize seus agentes de IA para diferentes finalidades.
            </p>
          </div>
          <Button className="md:w-auto w-full">
            <Plus className="mr-2 h-4 w-4" /> Criar Novo Agente
          </Button>
        </div>
        
        <Tabs defaultValue="agents">
          <TabsList>
            <TabsTrigger value="agents">Tipos de Agentes</TabsTrigger>
            <TabsTrigger value="my-agents">Meus Agentes</TabsTrigger>
          </TabsList>
          <TabsContent value="agents" className="space-y-6">
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Escolha um tipo de agente para começar</h3>
              <AgentGrid />
            </div>
          </TabsContent>
          <TabsContent value="my-agents">
            <div className="mt-6 flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Nenhum agente criado ainda</h3>
              <p className="text-muted-foreground text-center max-w-md mt-2 mb-6">
                Crie seu primeiro agente de IA personalizado para automatizar tarefas de vendas, prospecção ou atendimento.
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Criar Agente
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recursos Disponíveis</CardTitle>
              <CardDescription>Recursos incluídos no seu plano atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <span>Agentes criados</span>
                <span className="font-medium">0 / 3</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Usuários</span>
                <span className="font-medium">1 / 1</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Automações</span>
                <span className="font-medium">0 / 2</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between py-2">
                <span>Plano atual</span>
                <span className="font-medium">Free</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Fazer upgrade</Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle>Começando</CardTitle>
              <CardDescription>Dicas para começar com o Agent Hub</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex gap-2 items-center">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">1</div>
                  <span>Escolha um tipo de agente para criar</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">2</div>
                  <span>Personalize o conhecimento e comportamento</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">3</div>
                  <span>Integre com suas ferramentas existentes</span>
                </li>
                <li className="flex gap-2 items-center">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">4</div>
                  <span>Teste e refine seu agente</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">Ver tutorial</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Suporte</CardTitle>
              <CardDescription>Obtenha ajuda quando precisar</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Tem dúvidas sobre como configurar seus agentes ou precisa de ajuda com integrações?
                Nossa equipe está aqui para ajudar.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Contatar suporte</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
