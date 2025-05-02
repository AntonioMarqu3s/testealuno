
import { useState, useRef, useCallback, useEffect } from 'react';

type UpdateQRCodeFunction = (instanceId: string) => Promise<boolean>;

export const useQRCodeTimer = (updateQRCodeFn: UpdateQRCodeFunction) => {
  const [timerCount, setTimerCount] = useState(60); // Increased to 60 seconds
  const timerIntervalRef = useRef<number | null>(null);
  const updateInProgressRef = useRef<boolean>(false);
  const updateTimeoutRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const MIN_UPDATE_INTERVAL = 30000; // Increased to 30 seconds minimum between updates

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
    
    setTimerCount(60); // Reset to 60 seconds
    updateInProgressRef.current = false;
  }, []);

  const startQRCodeUpdateTimer = useCallback((instanceId: string) => {
    // Clear any existing timers
    clearQRCodeTimer();
    
    // Record when we're starting this timer
    lastUpdateTimeRef.current = Date.now();
    
    setTimerCount(60); // Start from 60 seconds
    
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
                await updateQRCodeFn(instanceId);
              } catch (error) {
                console.error("Error updating QR code on timer expiration:", error);
              } finally {
                updateInProgressRef.current = false;
                updateTimeoutRef.current = null;
              }
            }, 500);
          }
          
          return 60; // Reset to 60 seconds
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
