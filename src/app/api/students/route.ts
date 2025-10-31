import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        level: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      parentName, 
      parentPhone, 
      dateOfBirth, 
      address, 
      status, 
      smsEnabled,
      levelId 
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !parentName || !parentPhone) {
      return NextResponse.json(
        { error: 'First name, last name, parent name, and parent phone are required' },
        { status: 400 }
      );
    }

    // Create the student
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phoneNumber: phoneNumber || null,
        parentName,
        parentPhone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || null,
        status: status || 'Active',
        smsEnabled: smsEnabled || false,
        levelId: levelId || null,
      },
      include: {
        level: true,
      },
    });

    // If levelId is provided, auto-enroll student in all class sections of that level
    if (levelId) {
      const classSections = await prisma.classSection.findMany({
        where: {
          subject: {
            levelId: levelId,
          },
          status: 'Scheduled',
        },
      });

      if (classSections.length > 0) {
        await prisma.enrollment.createMany({
          data: classSections.map((section) => ({
            studentId: student.id,
            classSectionId: section.id,
            status: 'Active',
          })),
        });
      }
    }

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
