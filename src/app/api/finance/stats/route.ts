import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // Format: YYYY-MM
    
    const now = new Date();
    const currentMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [year, monthNum] = currentMonth.split("-");
    
    const startOfMonth = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endOfMonth = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

    // Get student payments for the month
    const studentPayments = await prisma.studentPayment.findMany({
      where: {
        paymentDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: "Paid",
      },
    });

    const totalRevenue = studentPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Get expenses for the month
    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Get outstanding dues (all pending and overdue payments)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Auto-update overdue payments
    await prisma.studentPayment.updateMany({
      where: {
        status: "Pending",
        dueDate: {
          lt: today,
        },
      },
      data: {
        status: "Overdue",
      },
    });

    const outstandingPayments = await prisma.studentPayment.findMany({
      where: {
        status: {
          in: ["Pending", "Overdue"],
        },
      },
    });

    const totalOutstanding = outstandingPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const netProfit = totalRevenue - totalExpenses;

    // Get payment status distribution
    const paymentStatusCounts = await prisma.studentPayment.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // Get expense breakdown by category
    const expensesByCategory = await prisma.expense.groupBy({
      by: ["category"],
      _sum: {
        amount: true,
      },
      where: {
        expenseDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Get recent transactions
    const recentPayments = await prisma.studentPayment.findMany({
      take: 10,
      orderBy: {
        paymentDate: "desc",
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalExpenses,
        totalOutstanding,
        netProfit,
      },
      paymentStatusCounts,
      expensesByCategory,
      recentPayments,
    });
  } catch (error) {
    console.error("Error fetching finance stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch finance stats" },
      { status: 500 }
    );
  }
}
