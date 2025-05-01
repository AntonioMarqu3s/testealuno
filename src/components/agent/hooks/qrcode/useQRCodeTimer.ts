
import { useState, useRef } from 'react';

export const useQRCodeTimer = (updateQRCode: (instanceName: string) => Promise<boolean>) => {
  const [timerCount, setTimerCount] = useState(30);
  const timerIntervalRef = useRef<number | null>(null);
  
  const clearQRCodeTimer = () => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };
  
  const startQRCodeUpdateTimer = (instanceName: string) => {
    setTimerCount(30);
    
    // Clear any existing interval
    clearQRCodeTimer();
    
    // Set new interval
    const intervalId = window.setInterval(() => {
      setTimerCount((prevCount) => {
        if (prevCount <= 1) {
          // Update QR code
          updateQRCode(instanceName);
          return 30;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    // Store interval ID for cleanup
    timerIntervalRef.current = intervalId;
  };

  return {
    timerCount,
    timerIntervalRef,
    startQRCodeUpdateTimer,
    clearQRCodeTimer
  };
};
