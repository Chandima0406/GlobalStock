import { useState, useEffect, useCallback } from 'react';

/**
 * Inactivity Timeout Hook
 * Automatically logs out users after a period of inactivity
 * 
 * @param {Function} onTimeout - Callback to execute when timeout occurs
 * @param {number} timeout - Timeout duration in milliseconds (default: 30 minutes)
 * @param {boolean} enabled - Whether the timeout is enabled
 * @returns {Object} - { timeRemaining, resetTimer, pauseTimer, resumeTimer }
 */
export const useInactivityTimeout = (onTimeout, timeout = 30 * 60 * 1000, enabled = true) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeout);

  // Reset the activity timer
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    setTimeRemaining(timeout);
  }, [timeout]);

  // Pause the timer
  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Resume the timer
  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    resetTimer();
  }, [resetTimer]);

  // Activity event handler
  const handleActivity = useCallback(() => {
    if (!isPaused && enabled) {
      resetTimer();
    }
  }, [isPaused, enabled, resetTimer]);

  // Setup activity listeners
  useEffect(() => {
    if (!enabled) return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Throttle activity updates (max once per second)
    let throttleTimeout;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          handleActivity();
          throttleTimeout = null;
        }, 1000);
      }
    };

    events.forEach(event => {
      window.addEventListener(event, throttledHandler);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledHandler);
      });
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [enabled, handleActivity]);

  // Check for timeout
  useEffect(() => {
    if (!enabled || isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = Math.max(0, timeout - elapsed);
      
      setTimeRemaining(remaining);

      if (elapsed >= timeout) {
        console.warn('Inactivity timeout reached. Logging out...');
        clearInterval(interval);
        onTimeout();
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [enabled, isPaused, lastActivity, timeout, onTimeout]);

  return {
    timeRemaining,
    resetTimer,
    pauseTimer,
    resumeTimer,
    isActive: timeRemaining > 0
  };
};

/**
 * Inactivity Warning Hook
 * Shows a warning before logout
 * 
 * @param {number} timeRemaining - Time remaining in milliseconds
 * @param {number} warningThreshold - When to show warning (default: 5 minutes)
 * @returns {boolean} - Whether to show warning
 */
export const useInactivityWarning = (timeRemaining, warningThreshold = 5 * 60 * 1000) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setShowWarning(timeRemaining > 0 && timeRemaining <= warningThreshold);
  }, [timeRemaining, warningThreshold]);

  return showWarning;
};

/**
 * Format time remaining for display
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} - Formatted time string (e.g., "5:30")
 */
export const formatTimeRemaining = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default {
  useInactivityTimeout,
  useInactivityWarning,
  formatTimeRemaining
};
