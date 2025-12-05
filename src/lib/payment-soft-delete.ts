import { prisma } from '@/lib/prisma';
import { DeleteReason } from '@/generated/enums';

export interface PaymentSoftDeleteResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface PaymentSoftDeleteOptions {
  deleteReason?: DeleteReason;
  deletedBy?: string;
}

/**
 * Soft deletes a student payment by marking it as deleted
 */
export async function softDeleteStudentPayment(
  paymentId: string,
  options: PaymentSoftDeleteOptions = {}
): Promise<PaymentSoftDeleteResult> {
  try {
    console.log(`[${new Date().toISOString()}] PAYMENT_SOFT_DELETE: Attempting to soft delete payment ${paymentId}`);

    // Check if payment exists and is not already deleted
    const existingPayment = await prisma.studentPayment.findUnique({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      return {
        success: false,
        message: 'Student payment not found'
      };
    }

    if (existingPayment.isDeleted) {
      return {
        success: false,
        message: 'Student payment is already deleted'
      };
    }

    // Soft delete the payment
    await prisma.studentPayment.update({
      where: { id: paymentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: options.deletedBy,
        deleteReason: options.deleteReason || 'OTHER'
      }
    });

    console.log(`[${new Date().toISOString()}] PAYMENT_SOFT_DELETE: Successfully soft deleted payment ${paymentId}`, {
      deleteReason: options.deleteReason,
      deletedBy: options.deletedBy
    });

    return {
      success: true,
      message: 'Student payment soft deleted successfully'
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] PAYMENT_SOFT_DELETE: Failed to soft delete payment ${paymentId}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      message: 'Failed to soft delete student payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Soft deletes a teacher payment by marking it as deleted
 */
export async function softDeleteTeacherPayment(
  paymentId: string,
  options: PaymentSoftDeleteOptions = {}
): Promise<PaymentSoftDeleteResult> {
  try {
    console.log(`[${new Date().toISOString()}] PAYMENT_SOFT_DELETE: Attempting to soft delete teacher payment ${paymentId}`);

    // Check if payment exists and is not already deleted
    const existingPayment = await prisma.teacherPayment.findUnique({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      return {
        success: false,
        message: 'Teacher payment not found'
      };
    }

    if (existingPayment.isDeleted) {
      return {
        success: false,
        message: 'Teacher payment is already deleted'
      };
    }

    // Soft delete the payment
    await prisma.teacherPayment.update({
      where: { id: paymentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: options.deletedBy,
        deleteReason: options.deleteReason || 'OTHER'
      }
    });

    console.log(`[${new Date().toISOString()}] PAYMENT_SOFT_DELETE: Successfully soft deleted teacher payment ${paymentId}`, {
      deleteReason: options.deleteReason,
      deletedBy: options.deletedBy
    });

    return {
      success: true,
      message: 'Teacher payment soft deleted successfully'
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] PAYMENT_SOFT_DELETE: Failed to soft delete teacher payment ${paymentId}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      message: 'Failed to soft delete teacher payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Restores a soft deleted student payment
 */
export async function restoreStudentPayment(paymentId: string): Promise<PaymentSoftDeleteResult> {
  try {
    console.log(`[${new Date().toISOString()}] PAYMENT_RESTORE: Attempting to restore student payment ${paymentId}`);

    const existingPayment = await prisma.studentPayment.findUnique({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      return {
        success: false,
        message: 'Student payment not found'
      };
    }

    if (!existingPayment.isDeleted) {
      return {
        success: false,
        message: 'Student payment is not deleted'
      };
    }

    await prisma.studentPayment.update({
      where: { id: paymentId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        deleteReason: null
      }
    });

    console.log(`[${new Date().toISOString()}] PAYMENT_RESTORE: Successfully restored student payment ${paymentId}`);

    return {
      success: true,
      message: 'Student payment restored successfully'
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] PAYMENT_RESTORE: Failed to restore student payment ${paymentId}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      message: 'Failed to restore student payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Restores a soft deleted teacher payment
 */
export async function restoreTeacherPayment(paymentId: string): Promise<PaymentSoftDeleteResult> {
  try {
    console.log(`[${new Date().toISOString()}] PAYMENT_RESTORE: Attempting to restore teacher payment ${paymentId}`);

    const existingPayment = await prisma.teacherPayment.findUnique({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      return {
        success: false,
        message: 'Teacher payment not found'
      };
    }

    if (!existingPayment.isDeleted) {
      return {
        success: false,
        message: 'Teacher payment is not deleted'
      };
    }

    await prisma.teacherPayment.update({
      where: { id: paymentId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        deleteReason: null
      }
    });

    console.log(`[${new Date().toISOString()}] PAYMENT_RESTORE: Successfully restored teacher payment ${paymentId}`);

    return {
      success: true,
      message: 'Teacher payment restored successfully'
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] PAYMENT_RESTORE: Failed to restore teacher payment ${paymentId}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      message: 'Failed to restore teacher payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Permanently deletes a student payment (hard delete)
 * This should only be used for data cleanup after retention period
 */
export async function permanentDeleteStudentPayment(paymentId: string): Promise<PaymentSoftDeleteResult> {
  try {
    console.log(`[${new Date().toISOString()}] PAYMENT_PERMANENT_DELETE: Attempting to permanently delete student payment ${paymentId}`);

    // First check if payment is soft deleted
    const existingPayment = await prisma.studentPayment.findUnique({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      return {
        success: false,
        message: 'Student payment not found'
      };
    }

    if (!existingPayment.isDeleted) {
      return {
        success: false,
        message: 'Cannot permanently delete active payment. Soft delete first.'
      };
    }

    // Delete the payment permanently
    await prisma.studentPayment.delete({
      where: { id: paymentId }
    });

    console.log(`[${new Date().toISOString()}] PAYMENT_PERMANENT_DELETE: Successfully permanently deleted student payment ${paymentId}`);

    return {
      success: true,
      message: 'Student payment permanently deleted'
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] PAYMENT_PERMANENT_DELETE: Failed to permanently delete student payment ${paymentId}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      message: 'Failed to permanently delete student payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Permanently deletes a teacher payment (hard delete)
 * This should only be used for data cleanup after retention period
 */
export async function permanentDeleteTeacherPayment(paymentId: string): Promise<PaymentSoftDeleteResult> {
  try {
    console.log(`[${new Date().toISOString()}] PAYMENT_PERMANENT_DELETE: Attempting to permanently delete teacher payment ${paymentId}`);

    // First check if payment is soft deleted
    const existingPayment = await prisma.teacherPayment.findUnique({
      where: { id: paymentId }
    });

    if (!existingPayment) {
      return {
        success: false,
        message: 'Teacher payment not found'
      };
    }

    if (!existingPayment.isDeleted) {
      return {
        success: false,
        message: 'Cannot permanently delete active payment. Soft delete first.'
      };
    }

    // Delete the payment permanently
    await prisma.teacherPayment.delete({
      where: { id: paymentId }
    });

    console.log(`[${new Date().toISOString()}] PAYMENT_PERMANENT_DELETE: Successfully permanently deleted teacher payment ${paymentId}`);

    return {
      success: true,
      message: 'Teacher payment permanently deleted'
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] PAYMENT_PERMANENT_DELETE: Failed to permanently delete teacher payment ${paymentId}`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      message: 'Failed to permanently delete teacher payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Gets soft deleted student payments with pagination
 */
export async function getSoftDeletedStudentPayments(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.studentPayment.findMany({
      where: { isDeleted: true },
      skip,
      take: limit,
      orderBy: { deletedAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            level: {
              select: {
                name: true,
                levelNumber: true,
              },
            },
          },
        },
      },
    }),
    prisma.studentPayment.count({
      where: { isDeleted: true }
    })
  ]);

  return {
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Gets soft deleted teacher payments with pagination
 */
export async function getSoftDeletedTeacherPayments(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.teacherPayment.findMany({
      where: { isDeleted: true },
      skip,
      take: limit,
      orderBy: { deletedAt: 'desc' },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.teacherPayment.count({
      where: { isDeleted: true }
    })
  ]);

  return {
    payments,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}