'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCurrentLocation, isWithinRadius } from '@/lib/geolocation';
import { Loader2, MapPin } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, try to sign in to get user role
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Get the session to check user role
      const session = await getSession();
      
      if (!session) {
        setError('Authentication failed');
        setLoading(false);
        return;
      }

      // If user is admin, redirect to admin dashboard
      if (session.user.role === 'ADMIN') {
        router.push('/admin');
        return;
      }

      // For employees, check location
      if (session.user.role === 'EMPLOYEE') {
        setCheckingLocation(true);
        
        try {
          // Get user's current location
          const userLocation = await getCurrentLocation();
          
          // Get office location
          const response = await fetch('/api/office-location');
          const officeLocation = await response.json();
          
          if (!officeLocation) {
            setError('Office location not configured. Contact your administrator.');
            setLoading(false);
            setCheckingLocation(false);
            return;
          }

          // Check if user is within office radius
          const withinRadius = isWithinRadius(
            userLocation,
            {
              latitude: officeLocation.latitude,
              longitude: officeLocation.longitude,
            },
            officeLocation.radius
          );

          if (!withinRadius) {
            setError(`You must be within ${officeLocation.radius}m of the office to sign in.`);
            setLoading(false);
            setCheckingLocation(false);
            return;
          }

          // Auto check-in if location is valid
          await fetch('/api/attendance/checkin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }),
          });

          router.push('/dashboard');
        } catch (locationError) {
          console.error('Location error:', locationError);
          setError('Unable to verify your location. Please ensure location access is enabled.');
          setLoading(false);
          setCheckingLocation(false);
        }
      }
    } catch (error) {
      setError('An error occurred during sign in');
      setLoading(false);
      setCheckingLocation(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Employee Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {checkingLocation && (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Verifying your location...
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {checkingLocation ? 'Checking Location...' : 'Signing In...'}
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.push('/register')}
            >
              Create one here
            </Button>
          </div>

          <div className="mt-6 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
            <p className="font-semibold mb-1">Test Credentials:</p>
            <p><strong>Admin:</strong> admin@company.com / admin123</p>
            <p><strong>Employee:</strong> employee@company.com / employee123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}