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

    const level = await prisma.level.create({
      data: {
        name,
        levelNumber: parseInt(levelNumber),
        description,
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
