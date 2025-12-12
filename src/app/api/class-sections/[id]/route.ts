import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/session-sections/[id] - Get a specific session section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classSection = await prisma.classSection.findUnique({
      where: { id },
      include: {
        subject: { include: { class: true } },
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
        { error: 'Session section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(classSection);
  } catch (error) {
    console.error('Error fetching session section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session section' },
      { status: 500 }
    );
  }
}

// PATCH /api/session-sections/[id] - Update a session section
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      where: { id },
      data: {
        ...(name && { name }),
        ...(teacherId && { teacherId }),
        ...(capacity && { capacity }),
        ...(roomNumber !== undefined && { roomNumber }),
        ...(academicYear && { academicYear }),
        ...(status && { status }),
      },
      include: {
        subject: { include: { class: true } },
        teacher: true,
        schedules: true,
      },
    });

    return NextResponse.json(classSection);
  } catch (error) {
    console.error('Error updating session section:', error);
    return NextResponse.json(
      { error: 'Failed to update session section' },
      { status: 500 }
    );
  }
}

// DELETE /api/session-sections/[id] - Delete a session section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.classSection.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Session section deleted successfully' });
  } catch (error) {
    console.error('Error deleting session section:', error);
    return NextResponse.json(
      { error: 'Failed to delete session section' },
      { status: 500 }
    );
  }
}
