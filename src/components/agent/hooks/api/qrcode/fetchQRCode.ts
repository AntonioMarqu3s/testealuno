
import { PRIMARY_QR_CODE_ENDPOINT, FALLBACK_QR_CODE_ENDPOINT, QR_CODE_REQUEST_TIMEOUT } from './endpoints';
import { parseQRCodeResponse, getPlaceholderQRCode } from './responseHandlers';

/**
 * Fetch QR code from API
 * Attempts to fetch from primary endpoint, falls back to secondary if needed
 */
export const fetchQRCode = async (instanceName: string): Promise<string | null> => {
  try {
    console.log(`Fetching QR code for instance: ${instanceName}`);
    
    // Try primary endpoint
    try {
      const response = await fetch(PRIMARY_QR_CODE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName }),
      });
      
      if (!response.ok) {
        console.error("Primary endpoint error status:", response.status);
        throw new Error(`Failed to fetch QR code from primary endpoint: ${response.status}`);
      }
      
      const qrCode = await parseQRCodeResponse(response);
      if (qrCode) return qrCode;
      
    } catch (primaryError) {
      console.error("Primary endpoint error:", primaryError);
      
      // Try fallback endpoint
      console.log("Primary QR code endpoint failed, trying fallback...");
      try {
        const fallbackResponse = await fetch(FALLBACK_QR_CODE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instanceName }),
          signal: AbortSignal.timeout(QR_CODE_REQUEST_TIMEOUT), // 15 second timeout
        });
        
        if (!fallbackResponse.ok) {
          console.error("Fallback response not OK:", fallbackResponse.status);
          const errorText = await fallbackResponse.text();
          console.error("Fallback error text:", errorText);
          throw new Error(`Failed to fetch QR code from fallback endpoint: ${fallbackResponse.status}`);
        }
        
        const qrCode = await parseQRCodeResponse(fallbackResponse);
        if (qrCode) return qrCode;
      } catch (fallbackError) {
        console.error("Fallback endpoint error:", fallbackError);
      }
    }
  } catch (error) {
    console.error("Error fetching QR code:", error);
  }
  
  // For development purposes or as last resort, return a placeholder QR code
  return getPlaceholderQRCode();
};
