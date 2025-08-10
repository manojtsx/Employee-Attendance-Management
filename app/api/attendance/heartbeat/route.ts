import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    if (!attendance || !attendance.checkIn || attendance.checkOut) {
      // User is not currently checked in
      return NextResponse.json({ 
        status: 'not_checked_in',
        message: 'User is not currently checked in'
      });
    }

    // Update last heartbeat time
    await prisma.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        updatedAt: new Date(), // Use updatedAt as last heartbeat time
      },
    });

    // Calculate current working time
    const currentTime = new Date();
    const workingTime = (currentTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);

    return NextResponse.json({ 
      status: 'active',
      workingTime: Math.round(workingTime * 100) / 100,
      checkInTime: attendance.checkIn,
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { error: 'Heartbeat failed' },
      { status: 500 }
    );
  }
}
