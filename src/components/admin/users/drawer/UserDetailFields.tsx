
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserData } from "@/hooks/admin/useUserDetailDrawer";

interface UserDetailFieldsProps {
  userData: UserData | null;
  isLoading: boolean;
}

export function UserDetailFields({ userData, isLoading }: UserDetailFieldsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Usuário não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold">ID:</p>
          <p className="text-xs font-mono">{userData.id}</p>
        </div>
        
        <div>
          <p className="text-sm font-semibold">Criado em:</p>
          <p>{formatDate(userData.created_at)}</p>
        </div>
        
        <div>
          <p className="text-sm font-semibold">Último login:</p>
          <p>{userData.last_sign_in_at ? formatDate(userData.last_sign_in_at) : "Nunca"}</p>
        </div>
        
        <div>
          <p className="text-sm font-semibold">Status:</p>
          <Badge variant={userData.isActive ? "success" : "destructive"}>
            {userData.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        
        {userData.plan && (
          <div>
            <p className="text-sm font-semibold">Plano:</p>
            <div className="flex flex-col gap-1">
              <Badge className="w-fit">{userData.plan.name}</Badge>
              <p className="text-xs">Limite de agentes: {userData.plan.agent_limit}</p>
              {userData.plan.payment_status && (
                <p className="text-xs">Status de pagamento: {userData.plan.payment_status}</p>
              )}
              {userData.plan.subscription_ends_at && (
                <p className="text-xs">Expira em: {formatDate(userData.plan.subscription_ends_at)}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
