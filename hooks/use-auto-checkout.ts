'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface UseAutoCheckoutOptions {
  onCheckout?: () => void;
  heartbeatInterval?: number; // in milliseconds
  maxInactiveTime?: number; // in milliseconds
}

export function useAutoCheckout(options: UseAutoCheckoutOptions = {}) {
  const { data: session } = useSession();
  const {
    onCheckout,
    heartbeatInterval = 30000, // 30 seconds
    maxInactiveTime = 1800000, // 30 minutes
  } = options;

  const lastActivityRef = useRef(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();

  // Update last activity time
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Send heartbeat to server
  const sendHeartbeat = async () => {
    if (!session?.user) return;

    try {
      await fetch('/api/attendance/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  };

  // Auto checkout function
  const performAutoCheckout = async () => {
    if (!session?.user || session.user.role !== 'EMPLOYEE') return;

    try {
      const response = await fetch('/api/attendance/auto-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onCheckout?.();
      }
    } catch (error) {
      console.error('Auto checkout failed:', error);
    }
  };

  // Handle page unload (browser close/refresh)
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (session?.user?.role === 'EMPLOYEE') {
      // Send synchronous request for immediate checkout
      navigator.sendBeacon('/api/attendance/auto-checkout', 
        JSON.stringify({ reason: 'browser_close' }));
    }
  };

  // Check for inactivity
  const checkInactivity = () => {
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    
    if (timeSinceLastActivity >= maxInactiveTime) {
      performAutoCheckout();
    }
  };

  useEffect(() => {
    if (!session?.user || session.user.role !== 'EMPLOYEE') return;

    // Activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Before unload listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Start heartbeat
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
      checkInactivity();
    }, heartbeatInterval);

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [session, heartbeatInterval, maxInactiveTime]);

  return {
    updateActivity,
    performAutoCheckout,
  };
}
