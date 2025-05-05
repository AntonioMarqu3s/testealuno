async function testKiwifyWebhook() {
  const webhookUrl = "http://localhost:54321/functions/v1/kiwify-webhook"; // Altere para a URL do seu webhook

  const payload = {
    event: "purchase.completed",
    data: {
      userId: "usuario123",
      planId: 2,
      purchaseId: "compra456",
      amount: 99.90
    }
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseBody = await response.text();
    console.log("Status:", response.status);
    console.log("Resposta do webhook:", responseBody);
  } catch (error) {
    console.error("Erro ao enviar requisição para o webhook:", error);
  }
}

testKiwifyWebhook();
