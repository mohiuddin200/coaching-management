/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/enums";

// GET - List all student payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const monthYear = searchParams.get("monthYear");

    console.log("Fetching payments with filters:", { studentId, status, monthYear });

    const payments = await prisma.studentPayment.findMany({
      where: {
        isDeleted: false, // Only return non-deleted payments
        ...(studentId && { studentId }),
        ...(status && { status: status as PaymentStatus }),
        ...(monthYear && { monthYear }),
        student: {
          isDeleted: false, // Only include payments for non-deleted students
        },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Found payments:", payments.length);

    // Auto-update overdue payments
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overduePayments = payments.filter(
      (payment: { status: PaymentStatus; dueDate: Date }) =>
        payment.status === "Pending" && new Date(payment.dueDate) < today
    );

    if (overduePayments.length > 0) {
      await Promise.all(
        overduePayments.map((payment: { id: string }) =>
          prisma.studentPayment.update({
            where: { id: payment.id },
            data: { status: "Overdue" },
          })
        )
      );

      // Refetch with updated status
      const updatedPayments = await prisma.studentPayment.findMany({
        where: {
          isDeleted: false, // Only return non-deleted payments
          ...(studentId && { studentId }),
          ...(status && { status: status as PaymentStatus }),
          ...(monthYear && { monthYear }),
          student: {
            isDeleted: false, // Only include payments for non-deleted students
          },
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
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ data: updatedPayments });
    }

    console.log("Returning payments:", payments.length);
    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error("Error fetching student payments:", error);
    console.error("Full error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student payments" },
      { status: 500 }
    );
  }
}

// POST - Create new student payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      amount,
      paymentDate,
      dueDate,
      status,
      monthYear,
      description,
      receiptNo,
    } = body;

    // Validation
    if (!studentId || !amount || !paymentDate || !dueDate || !monthYear) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: studentId, amount, paymentDate, dueDate, monthYear",
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Auto-calculate status based on due date
    let paymentStatus = status || "Pending";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);

    if (paymentStatus === "Pending" && dueDateObj < today) {
      paymentStatus = "Overdue";
    }

    const payment = await prisma.studentPayment.create({
      data: {
        studentId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        dueDate: new Date(dueDate),
        status: paymentStatus,
        monthYear,
        description,
        receiptNo,
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

    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (error) {
    console.error("Error creating student payment:", error);
    return NextResponse.json(
      { error: "Failed to create student payment" },
      { status: 500 }
    );
  }
}

// PUT - Bulk update student payments (for status updates, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIds, updates } = body;

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json(
        { error: "paymentIds array is required" },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "updates object is required" },
        { status: 400 }
      );
    }

    // Validate that all payments exist and are not deleted
    const existingPayments = await prisma.studentPayment.findMany({
      where: {
        id: { in: paymentIds },
        isDeleted: false
      },
      select: { id: true }
    });

    if (existingPayments.length !== paymentIds.length) {
      return NextResponse.json(
        { error: "One or more payments not found or already deleted" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (updates.status) {
      updateData.status = updates.status;
    }

    if (updates.dueDate) {
      updateData.dueDate = new Date(updates.dueDate);
    }

    if (updates.paymentDate) {
      updateData.paymentDate = new Date(updates.paymentDate);
    }

    if (updates.amount !== undefined) {
      if (updates.amount <= 0) {
        return NextResponse.json(
          { error: "Amount must be greater than 0" },
          { status: 400 }
        );
      }
      updateData.amount = parseFloat(updates.amount);
    }

    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }

    if (updates.receiptNo !== undefined) {
      updateData.receiptNo = updates.receiptNo;
    }

    // Perform bulk update
    const result = await prisma.studentPayment.updateMany({
      where: {
        id: { in: paymentIds },
        isDeleted: false
      },
      data: updateData
    });

    // Fetch updated payments to return
    const updatedPayments = await prisma.studentPayment.findMany({
      where: {
        id: { in: paymentIds }
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      message: `Updated ${result.count} payments successfully`,
      data: updatedPayments
    });
  } catch (error) {
    console.error("Error updating student payments:", error);
    return NextResponse.json(
      { error: "Failed to update student payments" },
      { status: 500 }
    );
  }
}
