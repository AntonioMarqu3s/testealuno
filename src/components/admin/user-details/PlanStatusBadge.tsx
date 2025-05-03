
import React from "react";
import { Clock, CheckCircle, X, AlertTriangle } from "lucide-react";
import { UserPlan } from "./types";

interface PlanStatusBadgeProps {
  plan: UserPlan;
}

export function PlanStatusBadge({ plan }: PlanStatusBadgeProps) {
  const now = new Date();
  const trialEndsAt = plan.trial_ends_at ? new Date(plan.trial_ends_at) : null;
  const subscriptionEndsAt = plan.subscription_ends_at ? new Date(plan.subscription_ends_at) : null;
  
  if (trialEndsAt && trialEndsAt > now) {
    const daysLeft = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return (
      <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
        <Clock className="h-4 w-4" />
        <span>Período de teste ({daysLeft} dias restantes)</span>
      </div>
    );
  }
  
  if (plan.payment_status === "completed" && subscriptionEndsAt && subscriptionEndsAt > now) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
        <CheckCircle className="h-4 w-4" />
        <span>Assinatura ativa</span>
      </div>
    );
  }
  
  if (plan.payment_status === "pending") {
    return (
      <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
        <AlertTriangle className="h-4 w-4" />
        <span>Pagamento pendente</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
      <X className="h-4 w-4" />
      <span>Assinatura expirada</span>
    </div>
  );
}
