import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/levels/[id] - Get a specific level
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const level = await prisma.level.findUnique({
      where: { id: params.id },
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

    if (!level) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(level);
  } catch (error) {
    console.error('Error fetching level:', error);
    return NextResponse.json(
      { error: 'Failed to fetch level' },
      { status: 500 }
    );
  }
}

// PATCH /api/levels/[id] - Update a level
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, levelNumber, description, status } = body;

    const level = await prisma.level.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(levelNumber && { levelNumber: parseInt(levelNumber) }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(level);
  } catch (error) {
    console.error('Error updating level:', error);
    return NextResponse.json(
      { error: 'Failed to update level' },
      { status: 500 }
    );
  }
}

// DELETE /api/levels/[id] - Delete a level
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.level.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Level deleted successfully' });
  } catch (error) {
    console.error('Error deleting level:', error);
    return NextResponse.json(
      { error: 'Failed to delete level' },
      { status: 500 }
    );
  }
}
