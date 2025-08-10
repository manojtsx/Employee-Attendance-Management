import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodayUTC } from '@/lib/date-helpers';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'auto';

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

    // Update attendance record with auto checkout
    const updatedAttendance = await prisma.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        checkOut: checkOutTime,
        totalHours: Math.round(totalHours * 100) / 100,
      },
    });

    // Log the auto checkout reason
    console.log(`Auto checkout for user ${session.user.id} - reason: ${reason}`);

    return NextResponse.json({
      ...updatedAttendance,
      autoCheckout: true,
      reason,
    });
  } catch (error) {
    console.error('Auto checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to auto checkout' },
      { status: 500 }
    );
  }
}
