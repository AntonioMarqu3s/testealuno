
import { PlanType } from "@/services/plan/userPlanService";

export interface UserPlan {
  id: string;
  user_id: string;
  plan: PlanType;
  name: string;
  agent_limit: number;
  trial_ends_at: string | null;
  payment_date: string | null;
  subscription_ends_at: string | null;
  payment_status: string | null;
  connect_instancia: boolean;
  updated_at: string;
  trial_init: string | null;
}

export interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: Record<string, any>;
  plan?: UserPlan;
}

// Helper function to format dates consistently across components
export const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
