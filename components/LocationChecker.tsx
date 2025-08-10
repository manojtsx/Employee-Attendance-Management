'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCurrentLocation } from '@/lib/geolocation';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LocationCheckerProps {
  onLocationVerified: (latitude: number, longitude: number) => void;
}

export default function LocationChecker({ onLocationVerified }: LocationCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const checkLocation = async () => {
    setChecking(true);
    setError('');
    setStatus('idle');

    try {
      const location = await getCurrentLocation();
      
      // Verify location with server
      const response = await fetch('/api/office-location');
      const officeLocation = await response.json();
      
      if (!officeLocation) {
        throw new Error('Office location not configured');
      }

      // Calculate distance (simplified check on client)
      const distance = Math.sqrt(
        Math.pow(location.latitude - officeLocation.latitude, 2) +
        Math.pow(location.longitude - officeLocation.longitude, 2)
      ) * 111320; // Rough conversion to meters

      if (distance <= officeLocation.radius) {
        setStatus('success');
        onLocationVerified(location.latitude, location.longitude);
      } else {
        setStatus('error');
        setError(`You are ${Math.round(distance)}m from the office. You need to be within ${officeLocation.radius}m.`);
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to get location');
    }

    setChecking(false);
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={checkLocation}
        disabled={checking || status === 'success'}
        className="w-full"
        variant={status === 'success' ? 'default' : 'outline'}
      >
        {checking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking Location...
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Location Verified
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Verify Location
          </>
        )}
      </Button>

      {status === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Location verified! You are within the office premises.
          </AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}