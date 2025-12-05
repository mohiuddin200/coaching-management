import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { DeleteReason } from "@/generated/enums";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Get single student payment by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const payment = await prisma.studentPayment.findUnique({
      where: {
        id,
        isDeleted: false // Only return non-deleted payments
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            level: {
              select: {
                name: true,
                levelNumber: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Student payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: payment });
  } catch (error) {
    console.error("Error fetching student payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch student payment" },
      { status: 500 }
    );
  }
}

// PUT - Update student payment
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      amount,
      paymentDate,
      dueDate,
      status,
      monthYear,
      description,
      receiptNo,
    } = body;

    // Check if payment exists and is not deleted
    const existingPayment = await prisma.studentPayment.findUnique({
      where: {
        id,
        isDeleted: false
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Student payment not found" },
        { status: 404 }
      );
    }

    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Auto-calculate status based on due date if not provided
    let paymentStatus = status;
    if (!paymentStatus && dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDateObj = new Date(dueDate);
      dueDateObj.setHours(0, 0, 0, 0);

      if (dueDateObj < today) {
        paymentStatus = "Overdue";
      } else {
        paymentStatus = "Pending";
      }
    }

    const payment = await prisma.studentPayment.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(paymentDate && { paymentDate: new Date(paymentDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(paymentStatus && { status: paymentStatus }),
        ...(monthYear && { monthYear }),
        ...(description !== undefined && { description }),
        ...(receiptNo !== undefined && { receiptNo }),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            level: {
              select: {
                name: true,
                levelNumber: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: payment });
  } catch (error) {
    console.error("Error updating student payment:", error);
    return NextResponse.json(
      { error: "Failed to update student payment" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete student payment
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!user.user_metadata?.role || user.user_metadata.role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only Admin users can delete payments" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const deleteReason = searchParams.get("deleteReason");
    const permanent = searchParams.get("permanent") === "true";

    // Check if payment exists
    const existingPayment = await prisma.studentPayment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Student payment not found" },
        { status: 404 }
      );
    }

    // If payment is already soft deleted, only allow permanent deletion
    if (existingPayment.isDeleted && !permanent) {
      return NextResponse.json(
        { error: "Payment is already deleted. Use permanent=true to permanently delete." },
        { status: 400 }
      );
    }

    // Log deletion attempt
    console.log(`[${new Date().toISOString()}] PAYMENT_DELETE: Attempting to delete payment ${id}`, {
      userId: user.id,
      deleteReason,
      permanent,
      isAlreadyDeleted: existingPayment.isDeleted
    });

    if (permanent) {
      // For permanent deletion, the payment must be soft deleted first
      if (!existingPayment.isDeleted) {
        return NextResponse.json(
          { error: "Cannot permanently delete active payment. Soft delete first." },
          { status: 400 }
        );
      }

      // Permanently delete the payment
      await prisma.studentPayment.delete({
        where: { id },
      });

      console.log(`[${new Date().toISOString()}] PAYMENT_DELETE: Successfully permanently deleted payment ${id}`);

      return NextResponse.json({
        message: "Student payment permanently deleted"
      });
    }

    // Soft delete the payment
    const updatedPayment = await prisma.studentPayment.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.id,
        deleteReason: (deleteReason as DeleteReason) || "OTHER",
      },
    });

    console.log(`[${new Date().toISOString()}] PAYMENT_DELETE: Successfully soft deleted payment ${id}`, {
      deleteReason,
      deletedBy: user.id
    });

    return NextResponse.json({
      message: "Student payment deleted successfully",
      data: {
        id: updatedPayment.id,
        deletedAt: updatedPayment.deletedAt,
        deleteReason: updatedPayment.deleteReason
      }
    });
  } catch (error) {
    const { id } = await params;

    console.error(`[${new Date().toISOString()}] PAYMENT_DELETE: Failed to delete payment ${id}`, {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: "Failed to delete student payment" },
      { status: 500 }
    );
  }
}