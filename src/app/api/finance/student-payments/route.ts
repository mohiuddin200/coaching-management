import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

// GET - List all student payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const monthYear = searchParams.get("monthYear");

    const payments = await prisma.studentPayment.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(status && { status: status as PaymentStatus }),
        ...(monthYear && { monthYear }),
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
          ...(studentId && { studentId }),
          ...(status && { status: status as PaymentStatus }),
          ...(monthYear && { monthYear }),
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

    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error("Error fetching student payments:", error);
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
