import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Update the student
    const student = await prisma.student.update({
      where: { id },
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
        smsEnabled: smsEnabled !== undefined ? smsEnabled : false,
      },
    });

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Only Admin users can delete students.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete the student
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
