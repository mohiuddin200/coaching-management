import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/class-sections - Get all class sections (optional subjectId, teacherId query params)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const teacherId = searchParams.get('teacherId');
    const levelId = searchParams.get('levelId');

    const classSections = await prisma.classSection.findMany({
      where: {
        ...(subjectId && { subjectId }),
        ...(teacherId && { teacherId }),
        ...(levelId && { subject: { levelId } }),
      },
      include: {
        subject: {
          include: { level: true },
        },
        teacher: true,
        schedules: {
          where: { status: 'Active' },
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
            attendances: true,
          },
        },
      },
      orderBy: [
        { subject: { level: { levelNumber: 'asc' } } },
        { subject: { name: 'asc' } },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(classSections);
  } catch (error) {
    console.error('Error fetching class sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class sections' },
      { status: 500 }
    );
  }
}

// POST /api/class-sections - Create a new class section with schedules
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      subjectId,
      teacherId,
      capacity,
      roomNumber,
      academicYear,
      status,
      schedules,
    } = body;

    if (!name || !subjectId || !teacherId || !academicYear) {
      return NextResponse.json(
        { error: 'Name, subjectId, teacherId, and academicYear are required' },
        { status: 400 }
      );
    }

    const classSection = await prisma.classSection.create({
      data: {
        name,
        subjectId,
        teacherId,
        capacity: capacity || 30,
        roomNumber,
        academicYear,
        status: status || 'Scheduled',
        schedules: schedules
          ? {
              create: schedules.map(
                (schedule: {
                  dayOfWeek: string;
                  startTime: string;
                  endTime: string;
                }) => ({
                  dayOfWeek: schedule.dayOfWeek,
                  startTime: schedule.startTime,
                  endTime: schedule.endTime,
                  status: 'Active' as const,
                })
              ),
            }
          : undefined,
      },
      include: {
        subject: { include: { level: true } },
        teacher: true,
        schedules: true,
      },
    });

    return NextResponse.json(classSection, { status: 201 });
  } catch (error) {
    console.error('Error creating class section:', error);
    return NextResponse.json(
      { error: 'Failed to create class section' },
      { status: 500 }
    );
  }
}
