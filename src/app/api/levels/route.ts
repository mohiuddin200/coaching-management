import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/levels - Get all levels
export async function GET() {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { levelNumber: 'asc' },
      include: {
        _count: {
          select: {
            subjects: true,
            students: true,
          },
        },
      },
    });

    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    );
  }
}

// POST /api/levels - Create a new level
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, levelNumber, description, status } = body;

    if (!name || !levelNumber) {
      return NextResponse.json(
        { error: 'Name and level number are required' },
        { status: 400 }
      );
    }

    // Check if level number already exists
    const existingLevel = await prisma.level.findFirst({
      where: { levelNumber: parseInt(levelNumber) },
    });

    if (existingLevel) {
      return NextResponse.json(
        { error: 'A level with this number already exists' },
        { status: 400 }
      );
    }

    const level = await prisma.level.create({
      data: {
        name,
        levelNumber: parseInt(levelNumber),
        description: description || null,
        status: status || 'Active',
      },
    });

    return NextResponse.json(level, { status: 201 });
  } catch (error) {
    console.error('Error creating level:', error);
    return NextResponse.json(
      { error: 'Failed to create level' },
      { status: 500 }
    );
  }
}

// PUT /api/levels - Update a level
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, levelNumber, description, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Level ID is required' },
        { status: 400 }
      );
    }

    if (!name || !levelNumber) {
      return NextResponse.json(
        { error: 'Name and level number are required' },
        { status: 400 }
      );
    }

    // Check if level number already exists (excluding current level)
    const existingLevel = await prisma.level.findFirst({
      where: {
        levelNumber: parseInt(levelNumber),
        NOT: { id },
      },
    });

    if (existingLevel) {
      return NextResponse.json(
        { error: 'A level with this number already exists' },
        { status: 400 }
      );
    }

    const level = await prisma.level.update({
      where: { id },
      data: {
        name,
        levelNumber: parseInt(levelNumber),
        description: description || null,
        status: status || 'Active',
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
