
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserProfileCardProps {
  userEmail: string;
}

export function UserProfileCard({ userEmail }: UserProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil do Usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (Somente leitura)</Label>
            <Input 
              id="email"
              value={userEmail}
              readOnly
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Este email está associado às suas instâncias de agente. 
              Não é possível alterá-lo, pois isso afetaria a identificação dos seus agentes.
              Para alterar, contate o administrador.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
