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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, subject, qualifications, status } = body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { error: 'First name, last name, and phone number are required' },
        { status: 400 }
      );
    }

    // Create the teacher
    const teacher = await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phoneNumber,
        subject: subject || null,
        qualifications: qualifications || null,
        status: status || 'Active',
      },
    });

    return NextResponse.json({ teacher }, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    );
  }
}