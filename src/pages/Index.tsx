
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Nav */}
      <header className="px-4 md:px-6 py-3 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">AH</span>
            </div>
            <span className="font-bold text-lg">Agent Hub</span>
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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Crie agentes de IA <span className="text-primary">personalizados</span> para seu negócio
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Automatize vendas, prospecção e atendimento com agentes inteligentes adaptados às suas necessidades
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=register">
              <Button size="lg" className="w-full sm:w-auto">
                Começar agora
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Ver demonstração
            </Button>
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
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">AH</span>
            </div>
            <span className="font-bold">Agent Hub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Agent Hub. Todos os direitos reservados.
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
