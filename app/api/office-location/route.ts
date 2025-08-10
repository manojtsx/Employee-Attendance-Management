import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(10).max(1000).optional(),
});

export async function GET() {
  try {
    const location = await prisma.officeLocation.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch office location' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = locationSchema.parse(body);

    // Delete existing location (keep only one)
    await prisma.officeLocation.deleteMany({});

    // Create new location
    const location = await prisma.officeLocation.create({
      data: {
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        radius: validatedData.radius || 100,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to set office location' },
      { status: 500 }
    );
  }
}