
import React from "react";
import { Badge } from "@/components/ui/badge";

export function AdminAccessRestriction() {
  return (
    <div className="p-6 text-center">
      <Badge variant="outline" className="bg-amber-100 text-amber-800 mb-2">Acesso Restrito</Badge>
      <p>Apenas administradores master podem acessar esta seção.</p>
    </div>
  );
}
