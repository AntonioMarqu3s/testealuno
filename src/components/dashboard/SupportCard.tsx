
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const SupportCard = () => {
  return (
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
  );
};
