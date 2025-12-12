import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/classes/initialize - Initialize default classes (Session 1-10)
export async function POST() {
  try {
    const existingLevels = await prisma.class.count();
    
    if (existingLevels > 0) {
      return NextResponse.json(
        { message: 'Classes already initialized', count: existingLevels },
        { status: 200 }
      );
    }

    const classes = [];
    for (let i = 1; i <= 10; i++) {
      classes.push({
        name: `Session ${i}`,
        classNumber: i,
        description: `Grade ${i} - School Class`,
        status: 'Active' as const,
      });
    }

    const result = await prisma.class.createMany({
      data: classes,
    });

    return NextResponse.json(
      { message: 'Classes initialized successfully', count: result.count },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error initializing classes:', error);
    return NextResponse.json(
      { error: 'Failed to initialize classes' },
      { status: 500 }
    );
  }
}
