import { supabase } from "@/lib/supabase";

export interface Payment {
  id: string;
  userEmail: string;
  planName: string;
  amount: number;
  paymentDate: string | null;
  expirationDate: string | null;
  status: string;
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
