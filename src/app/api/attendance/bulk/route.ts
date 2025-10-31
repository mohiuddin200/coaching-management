import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Bulk mark attendance
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { attendanceData } = body; // Array of { studentId, classSectionId?, timestamp?, entryType? }

    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return NextResponse.json(
        { error: 'attendanceData must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate all student IDs exist
    const studentIds = attendanceData.map(a => a.studentId);
    const students = await prisma.student.findMany({
      where: {
        id: {
          in: studentIds,
        },
      },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some student IDs are invalid' },
        { status: 400 }
      );
    }

    // Create all attendance records
    const attendances = await prisma.attendance.createMany({
      data: attendanceData.map(item => ({
        studentId: item.studentId,
        classSectionId: item.classSectionId || null,
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        entryType: item.entryType || 'Entry',
      })),
    });

    return NextResponse.json({ 
      success: true, 
      count: attendances.count 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating bulk attendance:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance records' },
      { status: 500 }
    );
  }
}
