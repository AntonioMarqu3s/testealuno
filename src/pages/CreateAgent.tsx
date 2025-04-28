
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CreateAgentForm from "@/components/agent/CreateAgentForm";
import { useToast } from "@/hooks/use-toast";

const CreateAgent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type');

  if (!type) {
    toast({
      title: "Selecione um tipo de agente",
      description: "Por favor, escolha um tipo de agente antes de prosseguir com a criação.",
    });
    navigate('/dashboard?tab=agents');
    return null;
  }

  return (
    <MainLayout title="Criar Agente">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criar Novo Agente</h1>
          <p className="text-muted-foreground mt-2">
            Configure seu agente personalizado em algumas etapas simples
          </p>
        </div>
        <CreateAgentForm agentType={type} />
      </div>
    </MainLayout>
  );
};

export default CreateAgent;
