import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List all teacher payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    const payments = await prisma.teacherPayment.findMany({
      where: {
        ...(teacherId && { teacherId }),
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            salary: true,
            paymentType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error("Error fetching teacher payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher payments" },
      { status: 500 }
    );
  }
}

// POST - Create new teacher payment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      teacherId,
      amount,
      paymentDate,
      periodStart,
      periodEnd,
      description,
      receiptNo,
    } = body;

    // Validation
    if (!teacherId || !amount || !paymentDate || !periodStart || !periodEnd) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: teacherId, amount, paymentDate, periodStart, periodEnd",
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

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    const payment = await prisma.teacherPayment.create({
      data: {
        teacherId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: "Paid",
        description,
        receiptNo,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            salary: true,
            paymentType: true,
          },
        },
      },
    });

    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher payment:", error);
    return NextResponse.json(
      { error: "Failed to create teacher payment" },
      { status: 500 }
    );
  }
}
