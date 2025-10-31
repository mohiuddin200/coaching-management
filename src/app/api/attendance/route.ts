import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Get attendance records with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const studentId = searchParams.get('studentId');
    const classSectionId = searchParams.get('classSectionId');

    const where: {
      timestamp?: { gte: Date; lte: Date };
      studentId?: string;
      classSectionId?: string;
    } = {};

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.timestamp = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (classSectionId) {
      where.classSectionId = classSectionId;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            level: true,
          },
        },
        classSection: {
          include: {
            subject: {
              include: {
                level: true,
              },
            },
            teacher: true,
          },
        },
        class: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return NextResponse.json({ attendances });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

// Mark attendance (create new record)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, classSectionId, timestamp, entryType } = body;

    // Validate required fields
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // If classSectionId provided, verify it exists
    if (classSectionId) {
      const classSection = await prisma.classSection.findUnique({
        where: { id: classSectionId },
      });

      if (!classSection) {
        return NextResponse.json(
          { error: 'Class section not found' },
          { status: 404 }
        );
      }
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        classSectionId: classSectionId || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        entryType: entryType || 'Entry',
      },
      include: {
        student: {
          include: {
            level: true,
          },
        },
        classSection: {
          include: {
            subject: {
              include: {
                level: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ attendance }, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    );
  }
}
