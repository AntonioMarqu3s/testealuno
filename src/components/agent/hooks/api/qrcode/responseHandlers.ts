
/**
 * Utility functions for handling API responses
 */

/**
 * Extracts QR code data from a text response
 */
export const extractQRCodeFromText = (textData: string): string | null => {
  console.log("Received text response, length:", textData.length);
  if (textData.length > 100) { // Likely base64 data
    console.log("Text response sample:", textData.substring(0, 50) + "...");
    // Check if already has data:image prefix
    if (textData.startsWith('data:image')) {
      return textData;
    }
    return `data:image/png;base64,${textData.trim()}`;
  } else {
    console.error("Text response too short to be valid QR code:", textData);
    return null;
  }
};

/**
 * Extracts QR code data from a JSON response
 */
export const extractQRCodeFromJSON = (data: any): string | null => {
  console.log("Received JSON response:", Object.keys(data));
  
  // Check various possible response formats
  const base64Data = data.qrcode || data.qrCode || data.mensagem || data.qrCodeBase64 || data.base64 || data.data;
  
  if (base64Data) {
    console.log("Found base64 data in response, length:", base64Data.length);
    console.log("Base64 sample:", base64Data.substring(0, 50) + "...");
    // Check if already has data:image prefix
    if (base64Data.startsWith('data:image')) {
      return base64Data;
    }
    return `data:image/png;base64,${base64Data.trim()}`;
  } else {
    console.error("JSON response didn't contain QR code data:", data);
    return null;
  }
};

/**
 * Creates a URL from a blob
 */
export const createBlobURL = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

/**
 * Creates a placeholder QR code for development/fallback purposes
 */
export const getPlaceholderQRCode = (): string => {
  console.log("Using placeholder QR code due to errors");
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOdSURBVO3BQY4cOxIEwfAC//9l7x3jrYBBJNWjmRH2B2utP1hj3WCNdYM11g3WWDdYY91gjXWDNdYN1lg3WGPdYI11gzXWDdZYN1hj3WCN9YeXJPxJlW8kcJKqk4QnVZ0kfEPVScI3VJ0k/EmVb6yxbrDGusEa6wZf+LJKJ5W+odJJwkmlaYQTlU4qnVQ6SZhGOEnopNI3VPqmSt9U6ZvWWDdYY91gjXWDH/lhEk4qnSR0Ek5UTiqdJJyonFQ6SThROVF5UqWThBOVJwl/0hrrBmusG6yxbvAjf5mEE5WThBOVTsJJwknlROUk4UTlGwl/szXWDdZYN1hj3eArf7mEk4SThE6lk4SThBOVE5WThBOVTsKT1lg3WGPdYI11g6/8J1U6SThJOEk4SThJOKmYVDpRmRKeWmPdYI11gzXWDb7yn1TpJOEk4YlKJwknKicJJwmdSicJJwmdypPK32yNdYM11g3WWDf4wpclTCp9Q6WThCdVOkk4STipeKLSSUIn4YlK31TpJOEba6wbrLFusMa6wR9eSphUOkl4knCi8kSlk4QnlU4STlSeJDxR6SRhUukk4U9aY91gjXWDNdYNfuRFCZ1KJwmdSicJJwmdSicJnconCSrfUOmTEk5UOkn4xhrrBmusG6yxbvCHP0ylk4QnCSrfSOhU6iR0Ck9UThI6lScJJwknKk9aY91gjXWDNdYNfuRFCX9SpZOEJyqdJJwkPFHpJGFS6VsqnSScJExV+qY11g3WWDdYY93gCy+q9KRKJwknCScqnSR8otJJwonKpNJJwqTSScKTKn1DpZOEb6yxbrDGusEa6wY/8sNUnqh0knCi8g0JJwknCZNKJwknCU+qdJLwJOFJlX7SGusGa6wbrLFu8JW/XEKn8qRKJwlPEk5UnlQ6SThReaLSScKTKp2odJLwpDXWDdZYN1hj3eBHflilk4QTlU4SJpWeSJhUmhL+JpVOVDpJeNIa6wZrrBussbXlxUoqnSR8U8KJyknCNyV0Kp0kdAmdypOEE5Vvmk80rLFusMa6wRrrBl95UcKk0knCicqJyqTSk4QnKp0kTCqdJJyonKicJEwqnSR8otJJwjfWWDdYY91gjXWDH/mQSicJJwmdyknCpNJJwqRyktCpTCqdJEwqnSR0Kp2EE5VJ5ZPWWDdYY91gjXWDH/mXSXii0knCScKTKp0kTAmdSicJk0onCSdVOkl4knCi8qQ11g3WWDdYY93gD9Za/rDGusEa6wZrrBussbXlL22nNrxM003hAAAAAElFTkSuQmCC";
};

/**
 * Parses API response based on content type to extract QR code data
 */
export const parseQRCodeResponse = async (response: Response): Promise<string | null> => {
  try {
    const contentType = response.headers.get('content-type');
    console.log("Response content type:", contentType);
    
    // Handle image responses
    if (contentType && contentType.includes('image/')) {
      console.log("Received direct image response");
      const blob = await response.blob();
      return createBlobURL(blob);
    }
    
    // Handle text/plain responses (which might be base64)
    if (contentType && contentType.includes('text/plain')) {
      const textData = await response.text();
      return extractQRCodeFromText(textData);
    }
    
    // Handle JSON responses
    if (contentType && contentType.includes('application/json')) {
      let responseText;
      try {
        responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
          console.error("Empty JSON response received");
          return null;
        }
        
        const data = JSON.parse(responseText);
        return extractQRCodeFromJSON(data);
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        
        // If we have the response text, try to use it directly
        if (responseText && responseText.length > 100) {
          console.log("Attempting to use response text as base64 after JSON parse failure");
          return extractQRCodeFromText(responseText);
        }
        return null;
      }
    }
    
    // Try to parse as text anyway as last resort
    try {
      const text = await response.text();
      if (text && text.length > 100) {
        console.log("Attempting to use raw response as base64, length:", text.length);
        return extractQRCodeFromText(text);
      }
    } catch (textError) {
      console.error("Failed to extract text from response:", textError);
    }
    
    console.error("Could not extract QR code from response");
    return null;
  } catch (error) {
    console.error("Error in parseQRCodeResponse:", error);
    return null;
  }
};
