import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExpenseCategory } from "@/generated/enums";
import { SmsLog } from "@prisma/client";


// GET - List all expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const expenses = await prisma.expense.findMany({
      where: {
        ...(category && { category: category as ExpenseCategory }),
        ...(startDate &&
          endDate && {
            expenseDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      orderBy: {
        expenseDate: "desc",
      },
    });

    // If category is SMS, also fetch SMS logs
    if (category === "SMS") {
      const smsLogs = await prisma.smsLog.findMany({
        where: {
          cost: { not: null },
          ...(startDate &&
            endDate && {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const smsExpenses = smsLogs.map((log: SmsLog) => ({
        id: log.id,
        category: "SMS" as ExpenseCategory,
        amount: log.cost || 0,
        expenseDate: log.createdAt,
        description: `SMS to ${
          log.recipientPhone
        }: ${log.messageContent.substring(0, 50)}...`,
        vendor: "SMS Service",
        receiptNo: null,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
        isSmsLog: true,
      }));

      return NextResponse.json({
        data: [...expenses, ...smsExpenses].sort(
          (a, b) =>
            new Date(b.expenseDate).getTime() -
            new Date(a.expenseDate).getTime()
        ),
      });
    }

    return NextResponse.json({ data: expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST - Create new expense
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, amount, expenseDate, description, vendor, receiptNo } =
      body;

    // Validation
    if (!category || !amount || !expenseDate || !description) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: category, amount, expenseDate, description",
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

    const expense = await prisma.expense.create({
      data: {
        category: category as ExpenseCategory,
        amount: parseFloat(amount),
        expenseDate: new Date(expenseDate),
        description,
        vendor,
        receiptNo,
      },
    });

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
