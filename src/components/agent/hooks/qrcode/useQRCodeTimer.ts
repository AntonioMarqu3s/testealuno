
import { useState, useRef, useCallback, useEffect } from 'react';

type UpdateQRCodeFunction = (instanceId: string) => Promise<boolean>;

export const useQRCodeTimer = (updateQRCodeFn: UpdateQRCodeFunction) => {
  const [timerCount, setTimerCount] = useState(30); // Start at 30 seconds
  const timerIntervalRef = useRef<number | null>(null);
  const updateInProgressRef = useRef<boolean>(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const clearQRCodeTimer = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      setTimerCount(30); // Reset to 30 seconds
    }
    updateInProgressRef.current = false;
  }, []);

  const startQRCodeUpdateTimer = useCallback((instanceId: string) => {
    // Clear any existing timers
    clearQRCodeTimer();
    
    setTimerCount(30); // Start from 30 seconds
    
    // Start new timer
    timerIntervalRef.current = window.setInterval(() => {
      setTimerCount(prevCount => {
        // When timer reaches zero, reset and trigger QR code update
        if (prevCount <= 1) {
          console.log("QR Code timer expired, updating QR code...");
          
          // Only start update if not already in progress
          if (!updateInProgressRef.current) {
            updateInProgressRef.current = true;
            
            // Schedule update with slight delay to avoid race conditions
            setTimeout(async () => {
              try {
                console.log("Attempting to refresh QR code after timer expiration");
                const success = await updateQRCodeFn(instanceId);
                if (!success) {
                  console.error("Failed to update QR code on timer expiration");
                } else {
                  console.log("Successfully refreshed QR code after timer expiration");
                }
              } catch (error) {
                console.error("Error updating QR code on timer expiration:", error);
              } finally {
                updateInProgressRef.current = false;
                setTimerCount(30); // Reset to 30 seconds after update attempt
              }
            }, 200);
          }
          
          return 0; // Show 0 while updating
        }
        return prevCount - 1;
      });
    }, 1000);
    
  }, [clearQRCodeTimer, updateQRCodeFn]);

  return {
    timerCount,
    timerIntervalRef,
    startQRCodeUpdateTimer,
    clearQRCodeTimer
  };
};
