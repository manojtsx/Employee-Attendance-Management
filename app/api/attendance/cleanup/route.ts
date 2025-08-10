import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTodayUTC } from '@/lib/date-helpers';

// This endpoint should be called by a cron job or scheduled task
// to automatically checkout employees who forgot to checkout
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from authorized source (API key or internal)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_API_KEY || 'your-secret-cron-key';
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's date in UTC for consistent database storage
    const todayUTC = getTodayUTC();

    // Find all attendance records from today that are still checked in
    const unclosedAttendance = await prisma.attendance.findMany({
      where: {
        date: todayUTC,
        checkIn: { not: null },
        checkOut: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const results = [];

    for (const attendance of unclosedAttendance) {
      // Set checkout time to a reasonable end-of-day time (e.g., 6 PM)
      const endOfDay = new Date(todayUTC);
      endOfDay.setUTCHours(18, 0, 0, 0); // 6:00 PM UTC

      // If check-in was after 6 PM, set checkout to check-in + 8 hours
      const checkInTime = new Date(attendance.checkIn!);
      let checkOutTime = endOfDay;

      if (checkInTime.getUTCHours() >= 18) {
        checkOutTime = new Date(checkInTime.getTime() + (8 * 60 * 60 * 1000)); // 8 hours later
      }

      // Don't set checkout time in the future
      if (checkOutTime > new Date()) {
        checkOutTime = new Date();
      }

      const totalHours = 
        (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

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

      results.push({
        userId: attendance.user.id,
        userName: attendance.user.name,
        checkInTime: attendance.checkIn,
        autoCheckOutTime: checkOutTime,
        totalHours: Math.round(totalHours * 100) / 100,
      });

      console.log(`Auto checkout (EOD) for ${attendance.user.name} - ${totalHours.toFixed(2)} hours`);
    }

    return NextResponse.json({
      message: 'End-of-day auto checkout completed',
      processedCount: results.length,
      results,
    });
  } catch (error) {
    console.error('End-of-day checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to perform end-of-day checkout' },
      { status: 500 }
    );
  }
}
