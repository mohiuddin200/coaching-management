import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePageAccess } from '@/lib/permissions/server';

// GET /api/class-sections - Get all class sections (optional subjectId, teacherId query params)
export async function GET(request: NextRequest) {
  try {
    // Require authentication and check page access
    const userContext = await requirePageAccess('/classes');
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const teacherId = searchParams.get('teacherId');
    const levelId = searchParams.get('levelId');

    const classSections = await prisma.classSection.findMany({
      where: {
        organizationId: userContext.organizationId, // Filter by organization
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
    // Handle permission errors
    if (error instanceof Error && (error.message.includes("Forbidden") || error.message.includes("Unauthorized"))) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Forbidden") ? 403 : 401 }
      );
    }
    
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
    // Require authentication and check page access
    const userContext = await requirePageAccess('/classes');
    
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
        organizationId: userContext.organizationId, // NEW: Link to organization
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
