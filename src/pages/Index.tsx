
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, UserPlus, UserCheck, HeadsetIcon, BarChart3, MessageCircle, Target, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Nav */}
      <header className="px-4 md:px-6 py-3 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/138b7b5c-ce7a-42d1-bdf1-c2608f169d9c.png" 
              alt="Agente Conecta A.I." 
              className="h-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button>Registrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12 bg-gradient-radial from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute right-0 -top-32 w-48 h-48 md:w-64 md:h-64">
            <img
              src="/lovable-uploads/acab647a-5eb7-4930-ae7d-923dc70090c8.png"
              alt="WhatsApp Bot"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Crie agentes de IA <span className="text-primary">personalizados</span> para seu negócio
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Automatize vendas, prospecção e atendimento com agentes inteligentes adaptados às suas necessidades
          </p>
          <p className="mt-4 text-2xl text-primary font-medium">
            Conecte seu Whatsapp direto com o Agente e se surpreenda!
          </p>
          <div className="mt-10 flex justify-center">
            <Link to="/auth?tab=register">
              <Button size="lg">
                Começar agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 md:px-6 py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-lg bg-card border transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aumente seu faturamento com nossos robôs de atendimento e vendedores especialistas</h3>
              <p className="text-muted-foreground">Maximize suas vendas com atendimento automatizado 24/7 e vendedores virtuais treinados para converter.</p>
            </div>

            <div className="p-6 rounded-lg bg-card border transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Melhore a experiência do seu cliente com os atendimentos Humanizados</h3>
              <p className="text-muted-foreground">Ofereça um atendimento personalizado e natural, fazendo seus clientes se sentirem verdadeiramente compreendidos.</p>
            </div>

            <div className="p-6 rounded-lg bg-card border transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aumente seu ROI levando todo o tráfego de leads para o WhatsApp</h3>
              <p className="text-muted-foreground">Centralize seus leads no WhatsApp e ofereça um atendimento exclusivo e personalizado para cada cliente.</p>
            </div>

            <div className="p-6 rounded-lg bg-card border transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aumente a eficiência da sua equipe de vendas com nosso SDR especialista</h3>
              <p className="text-muted-foreground">Automatize a prospecção e qualificação de leads, permitindo que sua equipe foque nas negociações mais importantes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-4 md:px-6 py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Tipos de agentes disponíveis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-agent-sales/10 text-agent-sales rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Vendedor</h3>
              <p className="text-muted-foreground">Agente especializado em conduzir conversas de vendas e negociação.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-agent-sdr/10 text-agent-sdr rounded-lg flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">SDR</h3>
              <p className="text-muted-foreground">Especialista em prospecção e qualificação de leads para seu pipeline.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-agent-closer/10 text-agent-closer rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Closer</h3>
              <p className="text-muted-foreground">Especializado em fechamento de negócios e superação de objeções.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-agent-support/10 text-agent-support rounded-lg flex items-center justify-center mb-4">
                <HeadsetIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Atendimento</h3>
              <p className="text-muted-foreground">Suporte ao cliente 24/7 respondendo dúvidas e resolvendo problemas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-6 py-8 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/138b7b5c-ce7a-42d1-bdf1-c2608f169d9c.png" 
              alt="Agente Conecta A.I." 
              className="h-8"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Agente Conecta A.I. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Termos
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacidade
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
