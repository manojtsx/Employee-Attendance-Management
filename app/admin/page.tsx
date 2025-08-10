'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, TrendingUp, MapPin } from 'lucide-react';
import AttendanceTable from '@/components/AttendanceTable';
import OfficeLocationModal from '@/components/OfficeLocationModal';
import EmployeeManagement from '@/components/EmployeeManagement';
import DateFormatSettings from '@/components/DateFormatSettings';
import DateFormatToggle from '@/components/DateFormatToggle';

interface DashboardStats {
  totalEmployees: number;
  todayTotalHours: number;
  averageAttendance: number;
  checkedInToday: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    todayTotalHours: 0,
    averageAttendance: 0,
    checkedInToday: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchEmployees();
      fetchStats();
    }
  }, [session]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/attendance');
      if (response.ok) {
        const attendanceData = await response.json();
        
        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = attendanceData.filter((record: any) => 
          record.date.startsWith(today)
        );
        
        const totalHours = todayRecords.reduce((sum: number, record: any) => 
          sum + (record.totalHours || 0), 0
        );
        
        const checkedIn = todayRecords.filter((record: any) => 
          record.checkIn && !record.checkOut
        ).length;

        setStats({
          totalEmployees: employees.length,
          todayTotalHours: totalHours,
          averageAttendance: employees.length > 0 ? 
            (todayRecords.length / employees.length) * 100 : 0,
          checkedInToday: checkedIn,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600">
              Monitor attendance and manage employees
            </p>
          </div>
          <DateFormatToggle />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <OfficeLocationModal onLocationSet={() => {}} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
              <Clock className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayTotalHours.toFixed(1)}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageAttendance.toFixed(0)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently In</CardTitle>
              <MapPin className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.checkedInToday}</div>
            </CardContent>
          </Card>
        </div>

        {/* Date Format Settings */}
        <div className="mb-8">
          <DateFormatSettings />
        </div>

        {/* Employee Management */}
        <div className="mb-8">
          <EmployeeManagement />
        </div>

        {/* Attendance Table */}
        <AttendanceTable showUserColumn={true} />
      </div>
    </div>
  );
}