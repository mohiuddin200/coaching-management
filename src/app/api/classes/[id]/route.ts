import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/classes/[id] - Get a specific class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            _count: {
              select: { classSections: true },
            },
          },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}

// PATCH /api/classes/[id] - Update a class
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, classNumber, description, status } = body;

    const classData = await prisma.class.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(classNumber && { classNumber: parseInt(classNumber) }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id] - Delete a class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}
