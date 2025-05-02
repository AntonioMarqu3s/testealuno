
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export type AgentType = "sales" | "sdr" | "closer" | "support" | "broadcast" | "secretary" | "helpdesk" | "school" | "custom";

interface AgentCardProps {
  title: string;
  description: string;
  type: AgentType;
  icon: React.ReactNode;
  path?: string;
}

export function AgentCard({ title, description, type, icon, path = "/create-agent" }: AgentCardProps) {
  const navigate = useNavigate();
  
  const colorMap: Record<AgentType, string> = {
    sales: "from-indigo-500 to-indigo-700",
    sdr: "from-sky-500 to-sky-700",
    closer: "from-amber-500 to-amber-700",
    support: "from-emerald-500 to-emerald-700",
    broadcast: "from-rose-500 to-rose-700",
    secretary: "from-purple-500 to-purple-700",
    helpdesk: "from-teal-500 to-teal-700", // Added new color for helpdesk
    school: "from-blue-500 to-blue-700",
    custom: "from-violet-500 to-violet-700"
  };

  const handleClick = () => {
    navigate(`${path}?type=${type}`);
  };

  return (
    <Card 
      className="h-full overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer"
      onClick={handleClick}
    >
      <div className={cn(
        "h-2 w-full bg-gradient-to-r", 
        colorMap[type]
      )} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className={cn(
            "p-2 rounded-lg", 
            `text-agent-${type}`,
            `bg-agent-${type}/10`
          )}>
            {icon}
          </div>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <ul className="space-y-1 text-sm">
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
            <span>Personalização completa</span>
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
            <span>Templates prontos</span>
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
            <span>Conexão com CRM</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={cn(
            "w-full bg-gradient-to-r shadow-sm",
            colorMap[type]
          )}
          onClick={handleClick}
        >
          Criar Agente
        </Button>
      </CardFooter>
    </Card>
  );
}
