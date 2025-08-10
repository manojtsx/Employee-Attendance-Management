import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isWithinRadius } from '@/lib/geolocation';
import { getTodayUTC } from '@/lib/date-helpers';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Location data is required' },
        { status: 400 }
      );
    }

    // Get office location
    const officeLocation = await prisma.officeLocation.findFirst();

    if (!officeLocation) {
      return NextResponse.json(
        { error: 'Office location not set' },
        { status: 400 }
      );
    }

    // Check if user is within office radius
    const withinRadius = isWithinRadius(
      { latitude, longitude },
      {
        latitude: officeLocation.latitude,
        longitude: officeLocation.longitude,
      },
      officeLocation.radius
    );

    if (!withinRadius) {
      return NextResponse.json(
        { error: 'You must be at the office location to check in' },
        { status: 403 }
      );
    }

    // Get today's date in UTC for consistent database storage
    const todayUTC = getTodayUTC();

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: todayUTC,
        },
      },
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return NextResponse.json(
        { error: 'Already checked in today' },
        { status: 400 }
      );
    }

    // Create or update attendance record
    const attendance = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: todayUTC,
        },
      },
      update: {
        checkIn: new Date(),
      },
      create: {
        userId: session.user.id,
        date: todayUTC,
        checkIn: new Date(),
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    );
  }
}