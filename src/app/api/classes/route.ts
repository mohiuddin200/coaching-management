import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/classes - Get all classes
export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { classNumber: 'asc' },
      include: {
        _count: {
          select: {
            subjects: true,
            students: true,
          },
        },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST /api/classes - Create a new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, classNumber, description, status } = body;

    if (!name || !classNumber) {
      return NextResponse.json(
        { error: 'Name and class number are required' },
        { status: 400 }
      );
    }

    const classData = await prisma.class.create({
      data: {
        name,
        classNumber: parseInt(classNumber),
        description,
        status: status || 'Active',
      },
    });

    return NextResponse.json(classData, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
