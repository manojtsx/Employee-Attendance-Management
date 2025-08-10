import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodayUTC } from '@/lib/date-helpers';

export async function GET() {
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

    return NextResponse.json({
      hasCheckedIn: !!attendance?.checkIn,
      hasCheckedOut: !!attendance?.checkOut,
      checkInTime: attendance?.checkIn,
      checkOutTime: attendance?.checkOut,
      totalHours: attendance?.totalHours,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}