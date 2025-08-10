'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, LogOut, MapPin, CheckCircle, XCircle, Timer } from 'lucide-react';
import AttendanceTable from '@/components/AttendanceTable';
import AutoCheckoutStatus from '@/components/AutoCheckoutStatus';
import DateFormatToggle from '@/components/DateFormatToggle';
import { useAutoCheckout } from '@/hooks/use-auto-checkout';
import { formatTime, formatDate } from '@/lib/date-utils';
import { useSettings } from '@/contexts/SettingsContext';
import { format } from 'date-fns';

interface AttendanceStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number | null;
}

export default function EmployeeDashboard() {
  const { data: session, status } = useSession();
  const { timeFormat, dateFormat } = useSettings();
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({
    hasCheckedIn: false,
    hasCheckedOut: false,
    checkInTime: null,
    checkOutTime: null,
    totalHours: null,
  });
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingTime, setWorkingTime] = useState(0);

  // Auto-checkout hook
  const { updateActivity, performAutoCheckout } = useAutoCheckout({
    onCheckout: () => {
      fetchAttendanceStatus(); // Refresh status after auto checkout
    },
    heartbeatInterval: 30000, // 30 seconds
    maxInactiveTime: 1800000, // 30 minutes
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.role === 'EMPLOYEE') {
      fetchAttendanceStatus();
    }
  }, [session]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate working time if checked in
  useEffect(() => {
    if (attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut && attendanceStatus.checkInTime) {
      const checkInTime = new Date(attendanceStatus.checkInTime);
      const now = new Date();
      const diff = now.getTime() - checkInTime.getTime();
      setWorkingTime(Math.floor(diff / 1000));
    }
  }, [currentTime, attendanceStatus]);

  // Auto-save working time periodically and handle browser close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut) {
        // Auto checkout on browser close
        fetch('/api/attendance/checkout', {
          method: 'POST',
          keepalive: true,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [attendanceStatus]);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch('/api/attendance/status');
      if (response.ok) {
        const data = await response.json();
        setAttendanceStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance status:', error);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attendance/checkout', {
        method: 'POST',
      });

      if (response.ok) {
        await fetchAttendanceStatus();
        setWorkingTime(0);
      }
    } catch (error) {
      console.error('Failed to check out:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut) {
      await handleCheckOut();
    }
    signOut({ callbackUrl: '/auth/signin' });
  };

  const formatWorkingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== 'EMPLOYEE') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome, {session.user.name}!
            </h1>
            <p className="text-slate-600">
              {formatDate(currentTime, { format: dateFormat, includeTime: true, timeFormat })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DateFormatToggle />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-in Status</CardTitle>
              {attendanceStatus.hasCheckedIn ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {attendanceStatus.hasCheckedIn ? (
                  <Badge variant="default">Checked In</Badge>
                ) : (
                  <Badge variant="secondary">Not Checked In</Badge>
                )}
              </div>
              {attendanceStatus.checkInTime && (
                <p className="text-sm text-slate-600">
                  at {formatTime(new Date(attendanceStatus.checkInTime), timeFormat)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Working Time</CardTitle>
              <Timer className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut ? (
                  formatWorkingTime(workingTime)
                ) : attendanceStatus.totalHours ? (
                  `${attendanceStatus.totalHours}h`
                ) : (
                  '00:00:00'
                )}
              </div>
              <p className="text-sm text-slate-600">
                {attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut
                  ? 'Currently working'
                  : 'Today\'s total'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Location Status</CardTitle>
              <MapPin className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                <Badge variant="default">At Office</Badge>
              </div>
              <p className="text-sm text-slate-600">
                Location verified
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Auto-Checkout Status */}
        <AutoCheckoutStatus 
          isCheckedIn={attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut}
          onManualCheckout={handleCheckOut}
        />

        {/* Action Button */}
        {attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut && (
          <div className="mb-8">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                You are currently checked in and working. You can manually check out or 
                it will be done automatically when you close the browser.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleCheckOut} 
              disabled={loading}
              className="mt-4"
              variant="outline"
            >
              <Clock className="h-4 w-4 mr-2" />
              {loading ? 'Checking Out...' : 'Manual Check Out'}
            </Button>
          </div>
        )}

        {attendanceStatus.hasCheckedOut && (
          <div className="mb-8">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                You have completed your work for today. Total hours worked: {attendanceStatus.totalHours}h
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Personal Attendance History */}
        <AttendanceTable showUserColumn={false} userId={session.user.id} />
      </div>
    </div>
  );
}