
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const GettingStartedCard = () => {
  return (
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
  );
};
