
import { useState, useRef, useCallback, useEffect } from 'react';

type UpdateQRCodeFunction = (instanceId: string) => Promise<boolean>;

export const useQRCodeTimer = (updateQRCodeFn: UpdateQRCodeFunction) => {
  const [timerCount, setTimerCount] = useState(30); // Start at 30 seconds
  const timerIntervalRef = useRef<number | null>(null);
  const updateInProgressRef = useRef<boolean>(false);
  const updateTimeoutRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const MIN_UPDATE_INTERVAL = 15000; // Minimum 15 seconds between updates

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
      if (updateTimeoutRef.current !== null) {
        window.clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const clearQRCodeTimer = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (updateTimeoutRef.current !== null) {
      window.clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    
    setTimerCount(30); // Reset to 30 seconds
    updateInProgressRef.current = false;
  }, []);

  const startQRCodeUpdateTimer = useCallback((instanceId: string) => {
    // Clear any existing timers
    clearQRCodeTimer();
    
    // Record when we're starting this timer
    lastUpdateTimeRef.current = Date.now();
    
    setTimerCount(30); // Start from 30 seconds
    
    // Start new timer
    timerIntervalRef.current = window.setInterval(() => {
      setTimerCount(prevCount => {
        // When timer reaches zero, reset and trigger QR code update
        if (prevCount <= 1) {
          console.log("QR Code timer expired, updating QR code...");
          
          // Only start update if not already in progress and minimum time has elapsed
          if (!updateInProgressRef.current) {
            const currentTime = Date.now();
            const timeSinceLastUpdate = currentTime - lastUpdateTimeRef.current;
            
            if (timeSinceLastUpdate < MIN_UPDATE_INTERVAL) {
              console.log(`Too soon since last update (${timeSinceLastUpdate}ms), waiting...`);
              return 1; // Keep at 1 and check again next interval
            }
            
            updateInProgressRef.current = true;
            lastUpdateTimeRef.current = currentTime;
            
            // Schedule update with delay to avoid race conditions
            updateTimeoutRef.current = window.setTimeout(async () => {
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
                updateTimeoutRef.current = null;
              }
            }, 500);
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
