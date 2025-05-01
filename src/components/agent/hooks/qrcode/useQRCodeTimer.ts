
import { useState, useRef, useCallback } from 'react';

export const useQRCodeTimer = (updateQRCode: (instanceName: string) => Promise<boolean>) => {
  const [timerCount, setTimerCount] = useState(30);
  const timerIntervalRef = useRef<number | null>(null);
  
  const clearQRCodeTimer = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerCount(30); // Reset timer
  }, []);
  
  const startQRCodeUpdateTimer = useCallback((instanceName: string) => {
    // Reset timer to full value
    setTimerCount(30);
    
    // Clear any existing interval
    clearQRCodeTimer();
    
    console.log("Starting QR code update timer for instance:", instanceName);
    
    // Set new interval - counts down from 30 to 0
    const intervalId = window.setInterval(() => {
      setTimerCount((prevCount) => {
        const newCount = prevCount - 1;
        // When timer hits zero, update QR code and reset timer
        if (newCount <= 0) {
          console.log("Timer expired, updating QR code automatically");
          updateQRCode(instanceName).then(success => {
            if (success) {
              console.log("QR code updated successfully after timer expiry");
            } else {
              console.error("Failed to update QR code after timer expiry");
            }
          });
          return 30; // Reset to 30 seconds
        }
        return newCount;
      });
    }, 1000);
    
    // Store interval ID for cleanup
    timerIntervalRef.current = intervalId;
  }, [clearQRCodeTimer]);

  return {
    timerCount,
    timerIntervalRef,
    startQRCodeUpdateTimer,
    clearQRCodeTimer
  };
};
