import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/levels/initialize - Initialize default levels (Class 1-10)
export async function POST() {
  try {
    const existingLevels = await prisma.level.count();
    
    if (existingLevels > 0) {
      return NextResponse.json(
        { message: 'Levels already initialized', count: existingLevels },
        { status: 200 }
      );
    }

    const levels = [];
    for (let i = 1; i <= 10; i++) {
      levels.push({
        name: `Class ${i}`,
        levelNumber: i,
        description: `Grade ${i} - School Level`,
        status: 'Active' as const,
      });
    }

    const result = await prisma.level.createMany({
      data: levels,
    });

    return NextResponse.json(
      { message: 'Levels initialized successfully', count: result.count },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error initializing levels:', error);
    return NextResponse.json(
      { error: 'Failed to initialize levels' },
      { status: 500 }
    );
  }
}
