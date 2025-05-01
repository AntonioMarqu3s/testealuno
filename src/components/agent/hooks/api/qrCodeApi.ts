
import { toast } from 'sonner';

// Function to fetch QR code from API
export const fetchQRCode = async (instanceName: string): Promise<string | null> => {
  try {
    const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/atualizar-qr-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instanceName }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update QR code');
    }
    
    // Parse response
    const contentType = response.headers.get('content-type');
    let imgSrc;
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      const base64Data = data.mensagem || data.qrCodeBase64;
      
      if (!base64Data) {
        throw new Error('Invalid response format');
      }
      
      imgSrc = `data:image/png;base64,${base64Data}`;
    } else {
      const blob = await response.blob();
      imgSrc = URL.createObjectURL(blob);
    }
    
    return imgSrc;
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return null;
  }
};

// Function to check connection status
export const checkConnectionStatus = async (instanceId: string): Promise<boolean> => {
  try {
    console.log("Checking connection status for instance:", instanceId);
    
    const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/verificar-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instanceId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to check connection status');
    }
    
    const data = await response.json();
    console.log("Connection status response:", data);
    
    return data.status === 'connected' || data.isConnected === true;
  } catch (error) {
    console.error("Error checking connection status:", error);
    return false;
  }
};
