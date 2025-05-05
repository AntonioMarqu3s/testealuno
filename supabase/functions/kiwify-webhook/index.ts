import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("https://kjoliqtdyczggxkfprxx.supabase.co")!;
const supabaseServiceRoleKey = Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb2xpcXRkeWN6Z2d4a2Zwcnh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQ3MDQ4OCwiZXhwIjoyMDYyMDQ2NDg4fQ.479rHOtMEoJupe5zGYgxw6VqKTtISj8n3M5m5dURNUA")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();

    // Aqui você pode validar a assinatura do webhook da Kiwify, se disponível

    if (body.event === "purchase.completed") {
      const purchaseData = body.data;

      // Exemplo: atualizar o plano do usuário na tabela user_plans
      const { userId, planId, purchaseId, amount } = purchaseData;

      // Atualiza ou insere o plano do usuário
      const { error } = await supabase
        .from("user_plans")
        .upsert({
          user_id: userId,
          plan: planId,
          name: planId === 1 ? "Inicial" : planId === 2 ? "Padrão" : "Premium",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) {
        console.error("Erro ao atualizar plano do usuário:", error);
        return new Response("Internal Server Error", { status: 500 });
      }

      console.log("Plano do usuário atualizado com sucesso:", purchaseData);
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao processar webhook Kiwify:", error);
    return new Response("Bad Request", { status: 400 });
  }
});
