import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, UserPlus, UserCheck, HeadsetIcon, BarChart3, MessageCircle, Target, TrendingUp, Calendar, School } from "lucide-react";

const Index = () => {
  return (
    <div className="container py-24">
      <section className="hero text-center mb-20">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Inteligência Artificial para escalar suas vendas e atendimento
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Crie agentes de IA personalizados para sua empresa e automatize tarefas de vendas, prospecção e atendimento.
        </p>
        <div className="space-x-4">
          <Link to="/auth">
            <Button size="lg">Começar</Button>
          </Link>
          <Button variant="outline" size="lg">
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              Fale com um especialista
            </a>
          </Button>
        </div>
      </section>

      <section className="testimonials py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-2">O que nossos clientes estão dizendo</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Veja como a IA está transformando negócios e impulsionando resultados
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <p className="text-muted-foreground italic mb-4">
                "A IA da [Nome da Empresa] revolucionou nossa abordagem de vendas. Conseguimos aumentar a taxa de conversão em 30%!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">João Silva</h4>
                  <p className="text-sm text-muted-foreground">CEO da Empresa X</p>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <p className="text-muted-foreground italic mb-4">
                "O suporte ao cliente com IA nos permitiu reduzir o tempo de resposta e aumentar a satisfação dos clientes. Incrível!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
                  <HeadsetIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Maria Oliveira</h4>
                  <p className="text-sm text-muted-foreground">Gerente de Atendimento da Empresa Y</p>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <p className="text-muted-foreground italic mb-4">
                "A análise de dados com IA nos forneceu insights valiosos para tomadas de decisão estratégicas. Estamos mais eficientes!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 mr-4 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Carlos Souza</h4>
                  <p className="text-sm text-muted-foreground">Diretor de Marketing da Empresa Z</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
    <div className="container py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Nossos Agentes</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Escolha entre nossos modelos de agentes especializados ou crie um personalizado
        </p>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Agentes Especializados para Cada Necessidade</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Temos agentes prontos para cada etapa do seu processo comercial e atendimento
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Vendedor</h3>
              <p className="text-muted-foreground">Especialista em vendas e negociação para aumentar sua receita.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">SDR</h3>
              <p className="text-muted-foreground">Especialista em prospecção e qualificação de leads para o seu negócio.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Closer</h3>
              <p className="text-muted-foreground">Especialista em fechamento de negócios para garantir o sucesso das suas vendas.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <HeadsetIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Atendimento</h3>
              <p className="text-muted-foreground">Suporte ao cliente e atendimento personalizado para garantir a satisfação.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Disparo</h3>
              <p className="text-muted-foreground">Especialista em disparo de mensagens em massa para alcançar um grande público.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Prospecção</h3>
              <p className="text-muted-foreground">Especialista em encontrar e qualificar novos leads para o seu negócio.</p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Marketing</h3>
              <p className="text-muted-foreground">Especialista em estratégias de marketing para aumentar a visibilidade da sua marca.</p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Secretária Pessoal</h3>
              <p className="text-muted-foreground">Gerencia agenda, emails e relatórios para otimizar seu tempo.</p>
            </div>
            
            {/* New School Helpdesk Card */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <School className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Helpdesk Escolar</h3>
              <p className="text-muted-foreground">Fornece informações sobre alunos, documentação necessária e horários de atividades.</p>
            </div>
            
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Index;
