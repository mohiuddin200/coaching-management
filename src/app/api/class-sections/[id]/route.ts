import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/class-sections/[id] - Get a specific class section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classSection = await prisma.classSection.findUnique({
      where: { id: params.id },
      include: {
        subject: { include: { level: true } },
        teacher: true,
        schedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        enrollments: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!classSection) {
      return NextResponse.json(
        { error: 'Class section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(classSection);
  } catch (error) {
    console.error('Error fetching class section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class section' },
      { status: 500 }
    );
  }
}

// PATCH /api/class-sections/[id] - Update a class section
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      teacherId,
      capacity,
      roomNumber,
      academicYear,
      status,
    } = body;

    const classSection = await prisma.classSection.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(teacherId && { teacherId }),
        ...(capacity && { capacity }),
        ...(roomNumber !== undefined && { roomNumber }),
        ...(academicYear && { academicYear }),
        ...(status && { status }),
      },
      include: {
        subject: { include: { level: true } },
        teacher: true,
        schedules: true,
      },
    });

    return NextResponse.json(classSection);
  } catch (error) {
    console.error('Error updating class section:', error);
    return NextResponse.json(
      { error: 'Failed to update class section' },
      { status: 500 }
    );
  }
}

// DELETE /api/class-sections/[id] - Delete a class section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.classSection.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Class section deleted successfully' });
  } catch (error) {
    console.error('Error deleting class section:', error);
    return NextResponse.json(
      { error: 'Failed to delete class section' },
      { status: 500 }
    );
  }
}
