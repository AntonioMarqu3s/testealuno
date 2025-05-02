
/**
 * Call webhook to delete instance from WhatsApp server
 */
export const deleteWhatsAppInstance = async (instanceName: string): Promise<boolean> => {
  try {
    console.log("Deleting WhatsApp instance:", instanceName);
    
    // Try multiple webhook endpoints in case one fails
    const endpoints = [
      'https://n8n-n8n.31kvca.easypanel.host/webhook/delete-instancia',
      'https://webhook.dev.matrixgpt.com.br/webhook/delete-instancia'
    ];
    
    let success = false;
    
    // Try each endpoint until one succeeds
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying webhook DELETE to endpoint: ${endpoint}`);
        
        const response = await fetch(`${endpoint}?instanceName=${encodeURIComponent(instanceName)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log("Successfully deleted WhatsApp instance");
          success = true;
          break;
        } else {
          console.warn(`Error response from endpoint ${endpoint}:`, response.status);
        }
      } catch (endpointError) {
        console.warn(`Failed to call endpoint ${endpoint}:`, endpointError);
        // Continue to try next endpoint
      }
    }
    
    return success;
  } catch (error) {
    console.error("Failed to delete WhatsApp instance:", error);
    return false;
  }
};
