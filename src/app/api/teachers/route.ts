import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}