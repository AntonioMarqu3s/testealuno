/**
 * API functions for QR code operations
 */

// Fetch QR code from API
export const fetchQRCode = async (instanceName: string): Promise<string | null> => {
  try {
    console.log(`Fetching QR code for instance: ${instanceName}`);
    
    // Try primary endpoint
    try {
      const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/atualizar-qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      });
      
      if (!response.ok) {
        console.error("Primary endpoint error status:", response.status);
        throw new Error('Failed to fetch QR code from primary endpoint');
      }
      
      const contentType = response.headers.get('content-type');
      console.log("Response content type:", contentType);
      
      // For text/plain responses (which might be base64)
      if (contentType && contentType.includes('text/plain')) {
        const textData = await response.text();
        console.log("Received text response, length:", textData.length);
        if (textData.length > 100) { // Likely base64 data
          return `data:image/png;base64,${textData}`;
        }
      }
      
      // For JSON responses
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log("Received JSON response:", Object.keys(data));
        
        // Check various possible response formats
        const base64Data = data.qrcode || data.qrCode || data.mensagem || data.qrCodeBase64 || data.base64;
        
        if (base64Data) {
          console.log("Found base64 data in response");
          return `data:image/png;base64,${base64Data}`;
        } else {
          console.error("JSON response didn't contain QR code data:", data);
        }
      }
      
      // For binary responses
      if (contentType && contentType.includes('image/')) {
        console.log("Received image response");
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      
      console.error("Could not extract QR code from response");
      throw new Error('Invalid response format');
      
    } catch (primaryError) {
      console.error("Primary endpoint error:", primaryError);
      
      // Try fallback endpoint
      console.log("Primary QR code endpoint failed, trying fallback...");
      const fallbackResponse = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/atualizar-qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      });
      
      if (!fallbackResponse.ok) {
        console.error("Fallback response not OK:", await fallbackResponse.text());
        throw new Error('Failed to fetch QR code from fallback endpoint');
      }
      
      const contentType = fallbackResponse.headers.get('content-type');
      console.log("Fallback response content type:", contentType);
      
      // Handle text/plain fallback response
      if (contentType && contentType.includes('text/plain')) {
        const textData = await fallbackResponse.text();
        console.log("Received text response from fallback, length:", textData.length);
        if (textData.length > 100) { // Likely base64 data
          return `data:image/png;base64,${textData}`;
        }
      }
      
      // Handle JSON fallback response
      if (contentType && contentType.includes('application/json')) {
        const data = await fallbackResponse.json();
        console.log("Received JSON response from fallback:", Object.keys(data));
        
        const base64Data = data.qrcode || data.qrCode || data.mensagem || data.qrCodeBase64 || data.base64;
        
        if (base64Data) {
          console.log("Found base64 data in fallback response");
          return `data:image/png;base64,${base64Data}`;
        }
      }
      
      // Handle binary fallback response
      if (contentType && contentType.includes('image/')) {
        console.log("Received image response from fallback");
        const blob = await fallbackResponse.blob();
        return URL.createObjectURL(blob);
      }
      
      console.error("Could not extract QR code from fallback response");
    }
  } catch (error) {
    console.error("Error fetching QR code:", error);
  }
  
  // For development purposes, return a placeholder QR code
  if (process.env.NODE_ENV === 'development') {
    console.log("Using placeholder QR code due to error");
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOdSURBVO3BQY4cOxIEwfAC//9l7x3jrYBBJNWjmRH2B2utP1hj3WCNdYM11g3WWDdYY91gjXWDNdYN1lg3WGPdYI11gzXWDdZYN1hj3WCN9YeXJPxJlW8kcJKqk4QnVZ0kfEPVScI3VJ0k/EmVb6yxbrDGusEa6wZf+LJKJ5W+odJJwkmlaYQTlU4qnVQ6SZhGOEnopNI3VPqmSt9U6ZvWWDdYY91gjXWDH/lhEk4qnSR0Ek5UTiqdJJyonFQ6SThROVF5UqWThBOVJwl/0hrrBmusG6yxbvAjf5mEE5WThBOVTsJJwknlROUk4UTlGwl/szXWDdZYN1hj3eArf7mEk4SThE6lk4SThBOVE5WThBOVTsKT1lg3WGPdYI11g6/8J1U6SThJOEk4SThJOKmYVDpRmRKeWmPdYI11gzXWDb7yn1TpJOEk4YlKJwknKicJJwmdSicJJwmdypPK32yNdYM11g3WWDf4wpclTCp9Q6WThCdVOkk4STipeKLSSUIn4YlK31TpJOEba6wbrLFusMa6wR9eSphUOkl4knCi8kSlk4QnlU4STlSeJDxR6SRhUukk4U9aY91gjXWDNdYNfuRFCZ1KJwmdSicJJwmdSicJnconCSrfUOmTEk5UOkn4xhrrBmusG6yxbvCHP0ylk4QnCSrfSOhU6iR0Ck9UThI6lScJJwknKk9aY91gjXWDNdYNfuRFCX9SpZOEJyqdJJwkPFHpJGFS6VsqnSScJExV+qY11g3WWDdYY93gCy+q9KRKJwknCScqnSR8otJJwonKpNJJwqTSScKTKn1DpZOEb6yxbrDGusEa6wY/8sNUnqh0knCi8g0JJwknCZNKJwknCU+qdJLwJOFJlX7SGusGa6wbrLFu8JW/XEKn8qRKJwlPEk5UnlQ6SThReaLSScKTKp2odJLwpDXWDdZYN1hj3eBHflilk4QTlU4SJpWeSJhUmhL+JpVOVDpJeNIa6wZrrBussbXlxUoqnSR8U8KJyknCNyV0Kp0kdAmdypOEE5Vvmk80rLFusMa6wRrrBl95UcKk0knCicqJyqTSk4QnKp0kTCqdJJyonKicJEwqnSR8otJJwjfWWDdYY91gjXWDH/mQSicJJwmdyknCpNJJwqRyktCpTCqdJEwqnSR0Kp2EE5VJ5ZPWWDdYY91gjXWDH/mXSXii0knCScKTKp0kTAmdSicJk0onCSdVOkl4knCi8qQ11g3WWDdYY93gD9Za/rDGusEa6wZrrBussbXlL22nNrxM003hAAAAAElFTkSuQmCC";
  }
  
  return null;
};

// Check connection status
export const checkConnectionStatus = async (instanceName: string): Promise<boolean> => {
  try {
    console.log(`Checking connection status for instance: ${instanceName}`);
    
    // Try primary endpoint
    try {
      const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/verificar-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check connection from primary endpoint');
      }
      
      const data = await response.json();
      console.log("Connection status response from primary:", data);
      
      return data.status === 'connected' || data.isConnected === true;
    } catch (primaryError) {
      // Try fallback endpoint
      console.log("Primary connection check endpoint failed, trying fallback...");
      const fallbackResponse = await fetch('https://webhook.dev.matrixgpt.com.br/webhook/verificar-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      });
      
      if (!fallbackResponse.ok) {
        // For development, return random status
        if (process.env.NODE_ENV === 'development') {
          const isConnected = Math.random() > 0.7;
          console.log("Using mock connection check:", isConnected);
          return isConnected;
        }
        throw new Error('Failed to check connection from both endpoints');
      }
      
      const data = await fallbackResponse.json();
      console.log("Connection status response from fallback:", data);
      
      return data.status === 'connected' || data.isConnected === true;
    }
  } catch (error) {
    console.error("Error checking connection status:", error);
    // For development, provide a fallback
    if (process.env.NODE_ENV === 'development') {
      return Math.random() > 0.7;
    }
    return false;
  }
};
