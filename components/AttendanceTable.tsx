'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, formatTime, formatTableDate } from '@/lib/date-utils';
import { useSettings } from '@/contexts/SettingsContext';
import UniversalDatePicker from '@/components/UniversalDatePicker';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: number | null;
  user: {
    name: string;
    email: string;
  };
}

interface AttendanceTableProps {
  showUserColumn?: boolean;
  userId?: string;
}

export default function AttendanceTable({ showUserColumn = false, userId }: AttendanceTableProps) {
  const { dateFormat, timeFormat } = useSettings();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Calculate pagination values
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = records.slice(startIndex, endIndex);

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
      if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);

      const response = await fetch(`/api/attendance?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setRecords(data);
        setTotalRecords(data.length);
        // Reset to first page when data changes
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [userId]);

  const handleFilter = () => {
    setLoading(true);
    fetchAttendance();
  };

  const formatTimeCell = (timeString: string | null) => {
    if (!timeString) return '-';
    return formatTime(timeString, timeFormat);
  };

  const formatDateCell = (dateString: string) => {
    return formatTableDate(dateString, dateFormat);
  };

  const getStatusBadge = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn) return <Badge variant="secondary">Not Checked In</Badge>;
    if (!checkOut) return <Badge variant="outline">In Progress</Badge>;
    return <Badge variant="default">Complete</Badge>;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Attendance Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <UniversalDatePicker
            value={startDate}
            onChange={setStartDate}
            placeholder="Start Date"
            label="From"
          />
          <UniversalDatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="End Date"
            label="To"
          />
          <div className="flex items-end">
            <Button onClick={handleFilter}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {showUserColumn && <TableHead>Employee</TableHead>}
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell 
                    colSpan={showUserColumn ? 6 : 5} 
                    className="text-center py-8"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={showUserColumn ? 6 : 5} 
                    className="text-center py-8 text-slate-500"
                  >
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                currentRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {formatDateCell(record.date)}
                    </TableCell>
                    {showUserColumn && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{record.user.name}</div>
                            <div className="text-sm text-slate-500">
                              {record.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>{formatTimeCell(record.checkIn)}</TableCell>
                    <TableCell>{formatTimeCell(record.checkOut)}</TableCell>
                    <TableCell>
                      {record.totalHours ? `${record.totalHours}h` : '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.checkIn, record.checkOut)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of {totalRecords} entries
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}