import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getTeacherRelatedRecords,
  createDeletionError,
  logDeletionAttempt,
  validateDeletionPermission,
  extractDeletionParams,
  handleForeignKeyError
} from '@/lib/soft-delete-utils';
import {
  softDeleteTeacher,
  permanentDeleteTeacher
} from '@/lib/soft-delete';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, subject, qualifications, status } = body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { error: 'First name, last name, and phone number are required' },
        { status: 400 }
      );
    }

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Update the teacher
    const teacher = await prisma.teacher.update({
      where: { id },
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

    return NextResponse.json({ teacher });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to update teacher' },
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

    const permissionCheck = validateDeletionPermission(user, 'teacher');
    if (!permissionCheck.valid) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { cascade, reassignTo, deleteReason } = extractDeletionParams(request);

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Log deletion attempt
    logDeletionAttempt('teacher', id, 'attempt', { cascade, deleteReason });

    // Check for related records before attempting deletion
    const relatedRecords = await getTeacherRelatedRecords(id);
    const hasRelatedRecords = Object.values(relatedRecords).some(count => count > 0);

    // If cascade is requested, perform permanent deletion
    if (cascade) {
      logDeletionAttempt('teacher', id, 'attempt', { action: 'cascade_delete', relatedRecords });
      
      // Delete related records in order to respect foreign key constraints
      if (relatedRecords.classSections > 0) {
        await prisma.classSection.deleteMany({ where: { teacherId: id } });
        logDeletionAttempt('teacher', id, 'success', { deletedRecords: 'classSections', count: relatedRecords.classSections });
      }
      
      if (relatedRecords.classes > 0) {
        await prisma.class.deleteMany({ where: { teacherId: id } });
        logDeletionAttempt('teacher', id, 'success', { deletedRecords: 'classes', count: relatedRecords.classes });
      }
      
      if (relatedRecords.payments > 0) {
        await prisma.teacherPayment.deleteMany({ where: { teacherId: id } });
        logDeletionAttempt('teacher', id, 'success', { deletedRecords: 'payments', count: relatedRecords.payments });
      }

      // Delete teacher permanently
      await prisma.teacher.delete({
        where: { id },
      });

      const message = `Teacher and all related records deleted permanently`;
      logDeletionAttempt('teacher', id, 'success', { action: 'cascade_delete', deleteReason });
      return NextResponse.json({ message });
    }

    // If there are related records and no cascade, show error
    if (hasRelatedRecords) {
      const error = createDeletionError('teacher', relatedRecords, { includeCascadeMessage: true });
      logDeletionAttempt('teacher', id, 'error', { errorDetails: error });
      return NextResponse.json(error, { status: 400 });
    }

    // Perform soft delete
    const softDeleteResult = await softDeleteTeacher(id, {
      deleteReason: deleteReason as 'RESIGNED' | 'TERMINATED' | 'REASSIGNED' | 'ERROR' | 'OTHER',
      deletedBy: user?.id
    });

    if (!softDeleteResult.success) {
      return NextResponse.json(
        { error: softDeleteResult.message },
        { status: 400 }
      );
    }

    logDeletionAttempt('teacher', id, 'success', { action: 'soft_delete', deleteReason });
    return NextResponse.json({ message: softDeleteResult.message });
  } catch (error) {
    const { id } = await params;
    
    // Handle foreign key constraint errors
    const fkError = handleForeignKeyError(error as Error, 'teacher', id);
    if (fkError) {
      return NextResponse.json(fkError, { status: 400 });
    }
    
    // Log general error
    logDeletionAttempt('teacher', id, 'error', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to delete teacher' },
      { status: 500 }
    );
  }
}
