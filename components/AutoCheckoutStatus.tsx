'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Clock, AlertTriangle } from 'lucide-react';

interface AutoCheckoutStatusProps {
  isCheckedIn: boolean;
  onManualCheckout?: () => void;
}

export default function AutoCheckoutStatus({ isCheckedIn, onManualCheckout }: AutoCheckoutStatusProps) {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [inactiveTime, setInactiveTime] = useState(0);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  const MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 25 * 60 * 1000; // 25 minutes

  useEffect(() => {
    if (!isCheckedIn) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      setLastActivity(Date.now());
      setShowInactivityWarning(false);
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    const timer = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      setInactiveTime(timeSinceLastActivity);
      
      if (timeSinceLastActivity >= WARNING_TIME && timeSinceLastActivity < MAX_INACTIVE_TIME) {
        setShowInactivityWarning(true);
      }
    }, 1000);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(timer);
    };
  }, [isCheckedIn, lastActivity]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    return Math.max(0, MAX_INACTIVE_TIME - inactiveTime);
  };

  if (!isCheckedIn) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Auto-Checkout Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Inactive Time:</span>
            <Badge variant={showInactivityWarning ? 'destructive' : 'secondary'}>
              {formatTime(inactiveTime)}
            </Badge>
          </div>

          {showInactivityWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You will be automatically checked out in {formatTime(getRemainingTime())} due to inactivity.
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setLastActivity(Date.now());
                      setShowInactivityWarning(false);
                    }}
                  >
                    I'm still here
                  </Button>
                  {onManualCheckout && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={onManualCheckout}
                      className="ml-2"
                    >
                      Check out now
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• You'll be automatically checked out after 30 minutes of inactivity</p>
            <p>• Closing the browser will also trigger auto-checkout</p>
            <p>• Your session is monitored with regular heartbeats</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
