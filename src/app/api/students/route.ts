import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
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
      smsEnabled 
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
      },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
