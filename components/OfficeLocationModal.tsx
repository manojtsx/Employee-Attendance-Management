'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Loader2 } from 'lucide-react';

interface OfficeLocationModalProps {
  onLocationSet: () => void;
}

interface OfficeLocation {
  latitude: number;
  longitude: number;
  radius: number;
}

export default function OfficeLocationModal({ onLocationSet }: OfficeLocationModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState<OfficeLocation | null>(null);
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    radius: '100',
  });

  useEffect(() => {
    if (open) {
      fetchCurrentLocation();
    }
  }, [open]);

  const fetchCurrentLocation = async () => {
    try {
      const response = await fetch('/api/office-location');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setCurrentLocation(data);
          setFormData({
            latitude: data.latitude.toString(),
            longitude: data.longitude.toString(),
            radius: data.radius.toString(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch current location:', error);
    }
  };

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
        setLoading(false);
      },
      (error) => {
        setError('Failed to get your current location.');
        setLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/office-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          radius: parseInt(formData.radius),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set office location');
      }

      setOpen(false);
      onLocationSet();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MapPin className="h-4 w-4 mr-2" />
          {currentLocation ? 'Update Office Location' : 'Set Office Location'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Office Location</DialogTitle>
        </DialogHeader>
        
        {currentLocation && (
          <div className="bg-slate-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-slate-600 mb-1">Current Office Location:</p>
            <p className="text-sm">
              <strong>Latitude:</strong> {currentLocation.latitude}<br />
              <strong>Longitude:</strong> {currentLocation.longitude}<br />
              <strong>Radius:</strong> {currentLocation.radius}m
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={getCurrentPosition}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Use My Current Location
              </>
            )}
          </Button>
          
          <div>
            <Label htmlFor="radius">Radius (meters)</Label>
            <Input
              id="radius"
              type="number"
              min="10"
              max="1000"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Set Location'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}