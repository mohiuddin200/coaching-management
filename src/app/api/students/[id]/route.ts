import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getStudentRelatedRecords,
  createDeletionError,
  logDeletionAttempt,
  validateDeletionPermission,
  extractDeletionParams,
  handleForeignKeyError
} from '@/lib/soft-delete-utils';
import {
  softDeleteStudent,
  permanentDeleteStudent
} from '@/lib/soft-delete';

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
      fatherName,
      fatherPhone,
      motherName,
      motherPhone,
      dateOfBirth, 
      address, 
      status, 
      smsEnabled,
      gender,
      bloodGroup,
      nationality,
      religion,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      previousSchool,
      previousClass,
      previousMarks,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      profileImage,
      birthCertificate,
      idProof,
    } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
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
        fatherName: fatherName || null,
        fatherPhone: fatherPhone || null,
        motherName: motherName || null,
        motherPhone: motherPhone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address || null,
        status: status || 'Active',
        smsEnabled: smsEnabled !== undefined ? smsEnabled : false,
        gender: gender || null,
        bloodGroup: bloodGroup || null,
        nationality: nationality || null,
        religion: religion || null,
        streetAddress: streetAddress || null,
        city: city || null,
        state: state || null,
        postalCode: postalCode || null,
        country: country || null,
        previousSchool: previousSchool || null,
        previousClass: previousClass || null,
        previousMarks: previousMarks !== undefined ? parseFloat(previousMarks) : null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        emergencyContactRelation: emergencyContactRelation || null,
        profileImage: profileImage || null,
        birthCertificate: birthCertificate || null,
        idProof: idProof || null,
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

    const permissionCheck = validateDeletionPermission(user, 'student');
    if (!permissionCheck.valid) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { cascade, reassignTo, deleteReason } = extractDeletionParams(request);

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

    // Log deletion attempt
    logDeletionAttempt('student', id, 'attempt', { cascade, deleteReason });

    // Check for related records before attempting deletion
    const relatedRecords = await getStudentRelatedRecords(id);
    const hasRelatedRecords = Object.values(relatedRecords).some(count => count > 0);

    // If cascade is requested, perform permanent deletion
    if (cascade) {
      logDeletionAttempt('student', id, 'attempt', { action: 'cascade_delete', relatedRecords });
      
      // Delete related records in order to respect foreign key constraints
      if (relatedRecords.attendances > 0) {
        await prisma.attendance.deleteMany({ where: { studentId: id } });
        logDeletionAttempt('student', id, 'success', { deletedRecords: 'attendances', count: relatedRecords.attendances });
      }
      
      if (relatedRecords.enrollments > 0) {
        await prisma.enrollment.deleteMany({ where: { studentId: id } });
        logDeletionAttempt('student', id, 'success', { deletedRecords: 'enrollments', count: relatedRecords.enrollments });
      }
      
      if (relatedRecords.payments > 0) {
        await prisma.studentPayment.deleteMany({ where: { studentId: id } });
        logDeletionAttempt('student', id, 'success', { deletedRecords: 'payments', count: relatedRecords.payments });
      }

      // Delete student permanently
      await prisma.student.delete({
        where: { id },
      });

      const message = `Student and all related records deleted permanently`;
      logDeletionAttempt('student', id, 'success', { action: 'cascade_delete', deleteReason });
      return NextResponse.json({ message });
    }

    // If there are related records and no cascade, show error
    if (hasRelatedRecords) {
      const error = createDeletionError('student', relatedRecords, { includeCascadeMessage: true });
      logDeletionAttempt('student', id, 'error', { errorDetails: error });
      return NextResponse.json(error, { status: 400 });
    }

    // Perform soft delete
    const softDeleteResult = await softDeleteStudent(id, {
      deleteReason: deleteReason as 'GRADUATED' | 'TRANSFERRED' | 'ERROR' | 'OTHER',
      deletedBy: user?.id
    });

    if (!softDeleteResult.success) {
      return NextResponse.json(
        { error: softDeleteResult.message },
        { status: 400 }
      );
    }

    logDeletionAttempt('student', id, 'success', { action: 'soft_delete', deleteReason });
    return NextResponse.json({ message: softDeleteResult.message });
  } catch (error) {
    const { id } = await params;
    
    // Handle foreign key constraint errors
    const fkError = handleForeignKeyError(error as Error, 'student', id);
    if (fkError) {
      return NextResponse.json(fkError, { status: 400 });
    }
    
    // Log general error
    logDeletionAttempt('student', id, 'error', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
