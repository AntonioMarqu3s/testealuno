
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { PlanType } from "@/services/plan/planTypes";

interface CreateUserFormProps {
  onSuccess: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [planType, setPlanType] = useState<string>(PlanType.FREE_TRIAL.toString());
  const [isLoading, setIsLoading] = useState(false);
  
  const { createUser } = useAdminUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await createUser(email, password, parseInt(planType));
      if (success) {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@exemplo.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="plan">Plano</Label>
        <Select value={planType} onValueChange={setPlanType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PlanType.FREE_TRIAL.toString()}>Teste Gratuito</SelectItem>
            <SelectItem value={PlanType.BASIC.toString()}>Inicial</SelectItem>
            <SelectItem value={PlanType.STANDARD.toString()}>Padrão</SelectItem>
            <SelectItem value={PlanType.PREMIUM.toString()}>Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              Criando...
            </span>
          ) : (
            "Criar Usuário"
          )}
        </Button>
      </div>
    </form>
  );
}
