import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List all fee structures
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const academicYear = searchParams.get("academicYear");

    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        ...(classId && { classId }),
        ...(academicYear && { academicYear }),
        isActive: true,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            classNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: feeStructures });
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee structures" },
      { status: 500 }
    );
  }
}

// POST - Create new fee structure
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, classId, amount, frequency, academicYear, description } =
      body;

    // Validation
    if (!name || !amount || !academicYear) {
      return NextResponse.json(
        { error: "Missing required fields: name, amount, academicYear" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        name,
        classId: classId || null,
        amount: parseFloat(amount),
        frequency: frequency || "Monthly",
        academicYear,
        description,
        isActive: true,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            classNumber: true,
          },
        },
      },
    });

    return NextResponse.json({ data: feeStructure }, { status: 201 });
  } catch (error) {
    console.error("Error creating fee structure:", error);
    return NextResponse.json(
      { error: "Failed to create fee structure" },
      { status: 500 }
    );
  }
}
