import { prisma } from '@/lib/prisma';

export interface RelatedRecordCount {
  [key: string]: number;
}

export interface DeletionError {
  error: string;
  details: RelatedRecordCount;
  message: string;
}

export interface SoftDeleteOptions {
  cascade?: boolean;
  reassignTo?: string;
  deleteReason?: string;
  deletedBy?: string;
}

/**
 * Checks for related records for a student
 */
export async function getStudentRelatedRecords(studentId: string): Promise<RelatedRecordCount> {
  const [attendances, enrollments, payments] = await Promise.all([
    prisma.attendance.count({ where: { studentId } }),
    prisma.enrollment.count({ where: { studentId } }),
    prisma.studentPayment.count({ where: { studentId } })
  ]);

  return {
    attendances,
    enrollments,
    payments
  };
}

/**
 * Checks for related records for a teacher
 */
export async function getTeacherRelatedRecords(teacherId: string): Promise<RelatedRecordCount> {
  const [classSections, classes, payments] = await Promise.all([
    prisma.classSection.count({ where: { teacherId } }),
    prisma.class.count({ where: { teacherId } }),
    prisma.teacherPayment.count({ where: { teacherId } })
  ]);

  return {
    classSections,
    classes,
    payments
  };
}

/**
 * Creates a standardized deletion error response
 */
export function createDeletionError(
  entityType: string,
  relatedRecords: RelatedRecordCount,
  options: { includeCascadeMessage?: boolean } = {}
): DeletionError {
  const hasRelatedRecords = Object.values(relatedRecords).some(count => count > 0);
  
  if (!hasRelatedRecords) {
    return {
      error: `Cannot delete ${entityType}: Unexpected error`,
      details: relatedRecords,
      message: 'An unexpected error occurred during deletion'
    };
  }

  const message = options.includeCascadeMessage 
    ? `Cannot delete ${entityType}: ${entityType} has related records. Please remove all related records before deletion or use cascade=true to delete all related records`
    : `Cannot delete ${entityType}: ${entityType} has related records. Please remove all related records before deletion`;

  return {
    error: `Cannot delete ${entityType}: ${entityType} has related records`,
    details: relatedRecords,
    message
  };
}

/**
 * Logs detailed deletion information for debugging
 */
export function logDeletionAttempt(
  entityType: string,
  entityId: string,
  action: 'attempt' | 'success' | 'error',
  details?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const logPrefix = `[${timestamp}] SOFT_DELETE: ${entityType.toUpperCase()}`;
  
  switch (action) {
    case 'attempt':
      console.log(`${logPrefix} Attempting to delete ${entityType} with ID: ${entityId}`);
      if (details) console.log(`${logPrefix} Related records:`, details);
      break;
    case 'success':
      console.log(`${logPrefix} Successfully deleted ${entityType} with ID: ${entityId}`);
      if (details) console.log(`${logPrefix} Additional details:`, details);
      break;
    case 'error':
      console.error(`${logPrefix} Failed to delete ${entityType} with ID: ${entityId}`);
      if (details) console.error(`${logPrefix} Error details:`, details);
      break;
  }
}

/**
 * Validates if a user has permission to perform deletion
 */
export function validateDeletionPermission(
  user: { user_metadata?: { role?: string } } | null,
  entityType: string
): { valid: boolean; error?: string } {
  if (!user) {
    return { valid: false, error: 'Authentication required' };
  }

  if (!user.user_metadata?.role || user.user_metadata.role !== 'Admin') {
    return {
      valid: false,
      error: `Unauthorized: Only Admin users can delete ${entityType}s.`
    };
  }

  return { valid: true };
}

/**
 * Extracts and validates request parameters for deletion
 */
export function extractDeletionParams(request: Request): {
  cascade: boolean;
  reassignTo?: string;
  deleteReason?: string;
} {
  const { searchParams } = new URL(request.url);
  
  return {
    cascade: searchParams.get('cascade') === 'true',
    reassignTo: searchParams.get('reassignTo') || undefined,
    deleteReason: searchParams.get('deleteReason') || undefined
  };
}

/**
 * Handles foreign key constraint errors with detailed logging
 */
export function handleForeignKeyError(
  error: Error | { message?: string },
  entityType: string,
  entityId: string
): DeletionError | null {
  if (error instanceof Error && error.message.includes('foreign key constraint')) {
    logDeletionAttempt(entityType, entityId, 'error', {
      errorType: 'foreign_key_constraint',
      errorMessage: error.message,
      stack: error.stack
    });

    return {
      error: `Cannot delete ${entityType}: Foreign key constraint violation`,
      details: {},
      message: `This ${entityType} cannot be deleted because it is referenced by other records`
    };
  }

  return null;
}