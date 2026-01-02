import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/class-sections/[id]/schedules/[scheduleId] - Update a schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const { scheduleId } = await params;
    const body = await request.json();
    const { dayOfWeek, startTime, endTime } = body;

    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'dayOfWeek, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}
