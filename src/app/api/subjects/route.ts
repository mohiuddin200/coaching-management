import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subjects - Get all subjects (optional levelId query param)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('levelId');

    const subjects = await prisma.subject.findMany({
      where: levelId ? { levelId } : undefined,
      include: {
        level: true,
        _count: {
          select: { classSections: true },
        },
      },
      orderBy: [
        { level: { levelNumber: 'asc' } },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

// POST /api/subjects - Create a new subject
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description, levelId, status } = body;

    if (!name || !levelId) {
      return NextResponse.json(
        { error: 'Name and levelId are required' },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        description,
        levelId,
        status: status || 'Active',
      },
      include: { level: true },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}
