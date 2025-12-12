import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subjects - Get all subjects (optional classId query param)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    const subjects = await prisma.subject.findMany({
      where: classId ? { classId } : undefined,
      include: {
        class: true,
        _count: {
          select: { classSections: true },
        },
      },
      orderBy: [
        { class: { classNumber: 'asc' } },
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
    const { name, code, description, classId, status } = body;

    if (!name || !classId) {
      return NextResponse.json(
        { error: 'Name and classId are required' },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        description,
        classId,
        status: status || 'Active',
      },
      include: { class: true },
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
