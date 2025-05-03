
import { supabase } from "@/lib/supabase";
import { PlanType } from "@/services/plan/userPlanService";
import { getCurrentUserEmailFromSupabase, forceSyncUserPlanWithSupabase } from "@/services/auth/supabaseAuth";

export interface Payment {
  id: string;
  userEmail: string;
  planName: string;
  amount: number;
  paymentDate: string | null;
  expirationDate: string | null;
  status: string;
}

/**
 * Upgrades the user to a specified plan
 * This is a local implementation for demonstration purposes
 */
export async function upgradeToPlan(email: string, planType: PlanType): Promise<boolean> {
  try {
    // Get user data by email to find their ID
    const { data: userData, error: userError } = await supabase
      .rpc('get_user_by_email', { p_email: email })
      .maybeSingle();
      
    if (userError) {
      console.error("Error finding user:", userError.message);
      throw new Error(`Error finding user: ${userError.message}`);
    }
    
    if (!userData) {
      console.error("User not found");
      return false;
    }
    
    const userId = userData.id;
    
    // Get current date for payment date
    const currentDate = new Date();
    
    // Set expiration date to 30 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    // Insert new plan record
    const { error: insertError } = await supabase
      .from('user_plans')
      .insert({
        user_id: userId,
        plan: planType,
        agent_limit: getPlanAgentLimit(planType),
        payment_date: currentDate.toISOString(),
        subscription_ends_at: expirationDate.toISOString(),
        payment_status: 'completed'
      });
    
    if (insertError) {
      console.error("Error inserting plan:", insertError.message);
      return false;
    }
    
    // Force sync the user's plan from Supabase
    await forceSyncUserPlanWithSupabase();
    
    return true;
  } catch (err) {
    console.error("Error in upgradeToPlan:", err);
    return false;
  }
}

// Fetch payment history by user email
export async function fetchPaymentHistoryByEmail(userEmail: string): Promise<{payments: Payment[]}> {
  try {
    // Call our edge function to get payment history
    const { data, error } = await supabase.functions.invoke('get_payment_history', {
      body: { userEmail }
    });
    
    if (error) {
      console.error("Error fetching payment history:", error);
      throw new Error(error.message || "Error fetching payment history");
    }
    
    return data || { payments: [] };
  } catch (err) {
    console.error("Error in fetchPaymentHistoryByEmail:", err);
    throw err;
  }
}

// Helper function to get agent limit based on plan type
function getPlanAgentLimit(planType: PlanType): number {
  switch (planType) {
    case PlanType.BASIC:
      return 1;
    case PlanType.STANDARD:
      return 3;
    case PlanType.PREMIUM:
      return 10;
    case PlanType.FREE_TRIAL:
    default:
      return 1;
  }
}
