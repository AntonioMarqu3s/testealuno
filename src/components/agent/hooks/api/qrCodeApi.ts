
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
        throw new Error('Failed to fetch QR code from primary endpoint');
      }
      
      // Handle response based on content type
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const base64Data = data.mensagem || data.qrCodeBase64;
        
        if (!base64Data) {
          throw new Error('Invalid response format');
        }
        
        return `data:image/png;base64,${base64Data}`;
      } else {
        // For binary response
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (primaryError) {
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
        // For development purposes, return a placeholder QR code if all else fails
        if (process.env.NODE_ENV === 'development') {
          console.log("Using placeholder QR code");
          return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOdSURBVO3BQY4cOxIEwfAC//9l7x3jrYBBJNWjmRH2B2utP1hj3WCNdYM11g3WWDdYY91gjXWDNdYN1lg3WGPdYI11gzXWDdZYN1hj3WCN9YeXJPxJlW8kcJKqk4QnVZ0kfEPVScI3VJ0k/EmVb6yxbrDGusEa6wZf+LJKJ5W+odJJwkmlaYQTlU4qnVQ6SZhGOEnopNI3VPqmSt9U6ZvWWDdYY91gjXWDH/lhEk4qnSR0Ek5UTiqdJJyonFQ6SThROVF5UqWThBOVJwl/0hrrBmusG6yxbvAjf5mEE5WThBOVTsJJwknlROUk4UTlGwl/szXWDdZYN1hj3eArf7mEk4SThE6lk4SThBOVE5WThBOVTsKT1lg3WGPdYI11g6/8J1U6SThJOEk4SThJOKmYVDpRmRKeWmPdYI11gzXWDb7yn1TpJOEk4YlKJwknKicJJwmdSicJJwmdypPK32yNdYM11g3WWDf4wpclTCp9Q6WThCdVOkk4STipeKLSSUIn4YlK31TpJOEba6wbrLFusMa6wR9eSphUOkl4knCi8kSlk4QnlU4STlSeJDxR6SRhUukk4U9aY91gjXWDNdYNfuRFCZ1KJwmdSicJJwmdSicJnconCSrfUOmTEk5UOkn4xhrrBmusG6yxbvCHP0ylk4QnCSrfSOhU6iR0Ck9UThI6lScJJwknKk9aY91gjXWDNdYNfuRFCX9SpZOEJyqdJJwkPFHpJGFS6VsqnSScJExV+qY11g3WWDdYY93gCy+q9KRKJwknCScqnSR8otJJwonKpNJJwqTSScKTKn1DpZOEb6yxbrDGusEa6wY/8sNUnqh0knCi8g0JJwknCZNKJwknCU+qdJLwJOFJlX7SGusGa6wbrLFu8JW/XEKn8qRKJwlPEk5UnlQ6SThReaLSScKTKp2odJLwpDXWDdZYN1hj3eBHflilk4QTlU4SJpWeSJhUmhL+JpVOVDpJeNIa6wZrrBussbXlxUoqnSR8U8KJyknCNyV0Kp0kdAmdypOEE5Vvmk80rLFusMa6wRrrBl95UcKk0knCicqJyqTSk4QnKp0kTCqdJJyonKicJEwqnSR8otJJwjfWWDdYY91gjXWDH/mQSicJJwmdyknCpNJJwqRyktCpTCqdJEwqnSR0Kp2EE5VJ5ZPWWDdYY91gjXWDH/mXSXii0knCScKTKp0kTAmdSicJk0onCSdVOkl4knCi8qQ11g3WWDdYY93gD9Za/rDGusEa6wZrrBussbXlL22nNrxM003hAAAAAElFTkSuQmCC";
        }
        throw new Error('Failed to fetch QR code from both endpoints');
      }
      
      // Handle fallback response based on content type
      const contentType = fallbackResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await fallbackResponse.json();
        const base64Data = data.mensagem || data.qrCodeBase64;
        
        if (!base64Data) {
          throw new Error('Invalid fallback response format');
        }
        
        return `data:image/png;base64,${base64Data}`;
      } else {
        // For binary response
        const blob = await fallbackResponse.blob();
        return URL.createObjectURL(blob);
      }
    }
  } catch (error) {
    console.error("Error fetching QR code:", error);
    
    // Return a placeholder QR code in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Returning placeholder QR code due to error");
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOdSURBVO3BQY4cOxIEwfAC//9l7x3jrYBBJNWjmRH2B2utP1hj3WCNdYM11g3WWDdYY91gjXWDNdYN1lg3WGPdYI11gzXWDdZYN1hj3WCN9YeXJPxJlW8kcJKqk4QnVZ0kfEPVScI3VJ0k/EmVb6yxbrDGusEa6wZf+LJKJ5W+odJJwkmlaYQTlU4qnVQ6SZhGOEnopNI3VPqmSt9U6ZvWWDdYY91gjXWDH/lhEk4qnSR0Ek5UTiqdJJyonFQ6SThROVF5UqWThBOVJwl/0hrrBmusG6yxbvAjf5mEE5WThBOVTsJJwknlROUk4UTlGwl/szXWDdZYN1hj3eArf7mEk4SThE6lk4SThBOVE5WThBOVTsKT1lg3WGPdYI11g6/8J1U6SThJOEk4SThJOKmYVDpRmRKeWmPdYI11gzXWDb7yn1TpJOEk4YlKJwknKicJJwmdSicJJwmdypPK32yNdYM11g3WWDf4wpclTCp9Q6WThCdVOkk4STipeKLSSUIn4YlK31TpJOEba6wbrLFusMa6wR9eSphUOkl4knCi8kSlk4QnlU4STlSeJDxR6SRhUukk4U9aY91gjXWDNdYNfuRFCZ1KJwmdSicJJwmdSicJnconCSrfUOmTEk5UOkn4xhrrBmusG6yxbvCHP0ylk4QnCSrfSOhU6iR0Ck9UThI6lScJJwknKk9aY91gjXWDNdYNfuRFCX9SpZOEJyqdJJwkPFHpJGFS6VsqnSScJExV+qY11g3WWDdYY93gCy+q9KRKJwknCScqnSR8otJJwonKpNJJwqTSScKTKn1DpZOEb6yxbrDGusEa6wY/8sNUnqh0knCi8g0JJwknCZNKJwknCU+qdJLwJOFJlX7SGusGa6wbrLFu8JW/XEKn8qRKJwlPEk5UnlQ6SThReaLSScKTKp2odJLwpDXWDdZYN1hj3eBHflilk4QTlU4SJpWeSJhUmhL+JpVOVDpJeNIa6wZrrBussbXlxUoqnSR8U8KJyknCNyV0Kp0kdAmdypOEE5Vvmk80rLFusMa6wRrrBl95UcKk0knCicqJyqTSk4QnKp0kTCqdJJyonKicJEwqnSR8otJJwjfWWDdYY91gjXWDH/mQSicJJwmdyknCpNJJwqRyktCpTCqdJEwqnSR0Kp2EE5VJ5ZPWWDdYY91gjXWDH/mXSXii0knCScKTKp0kTAmdSicJk0onCSdVOkl4knCi8qQ11g3WWDdYY93gD9Za/rDGusEa6wZrrBussbXlL22nNrxM003hAAAAAElFTkSuQmCC";
    }
    return null;
  }
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
