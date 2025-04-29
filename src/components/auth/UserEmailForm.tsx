
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getCurrentUserEmail, updateCurrentUserEmail } from "@/services/userPlanService";

export function UserEmailForm() {
  const [email, setEmail] = useState(getCurrentUserEmail());
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error("Email inválido", {
        description: "Por favor, insira um endereço de email válido."
      });
      return;
    }
    
    setIsUpdating(true);
    
    // Update email in local storage
    updateCurrentUserEmail(email);
    
    setTimeout(() => {
      toast.success("Email atualizado com sucesso", {
        description: "Seu email foi atualizado e será usado para identificar suas instâncias."
      });
      setIsUpdating(false);
    }, 500);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Email do Usuário</CardTitle>
        <CardDescription>Este email será usado para identificar suas instâncias de agente</CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateEmail}>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Atualizando..." : "Atualizar Email"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
