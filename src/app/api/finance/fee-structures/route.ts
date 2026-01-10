import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/permissions/server";

// GET - List all fee structures
export async function GET(request: NextRequest) {
  try {
    // Require finance page access
    const userContext = await requirePageAccess("/finance");

    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get("levelId");
    const academicYear = searchParams.get("academicYear");

    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        organizationId: userContext.organizationId, // Filter by organization
        ...(levelId && { levelId }),
        ...(academicYear && { academicYear }),
        isActive: true,
      },
      include: {
        level: {
          select: {
            id: true,
            name: true,
            levelNumber: true,
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
    // Require finance page access
    const userContext = await requirePageAccess("/finance");

    const body = await request.json();
    const { name, levelId, amount, frequency, academicYear, description } =
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
        organizationId: userContext.organizationId, // Link to organization
        name,
        levelId: levelId || null,
        amount: parseFloat(amount),
        frequency: frequency || "Monthly",
        academicYear,
        description,
        isActive: true,
      },
      include: {
        level: {
          select: {
            id: true,
            name: true,
            levelNumber: true,
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
