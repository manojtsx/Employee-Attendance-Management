import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodayUTC } from '@/lib/date-helpers';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get today's date in UTC for consistent database storage
    const todayUTC = getTodayUTC();

    // Find today's attendance record
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: todayUTC,
        },
      },
    });

    if (!attendance || !attendance.checkIn) {
      return NextResponse.json(
        { error: 'No check-in found for today' },
        { status: 400 }
      );
    }

    if (attendance.checkOut) {
      return NextResponse.json(
        { error: 'Already checked out today' },
        { status: 400 }
      );
    }

    const checkOutTime = new Date();
    const totalHours = 
      (checkOutTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);

    // Update attendance record
    const updatedAttendance = await prisma.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        checkOut: checkOutTime,
        totalHours: Math.round(totalHours * 100) / 100,
      },
    });

    return NextResponse.json(updatedAttendance);
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Failed to check out' },
      { status: 500 }
    );
  }
}