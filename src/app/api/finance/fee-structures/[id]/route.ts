import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET by ID - Get single fee structure
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id },
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

    if (!feeStructure) {
      return NextResponse.json(
        { error: "Fee structure not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: feeStructure });
  } catch (error) {
    console.error("Error fetching fee structure:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee structure" },
      { status: 500 }
    );
  }
}

// PUT - Update fee structure
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, levelId, amount, frequency, academicYear, description, isActive } = body;

    // Check if fee structure exists
    const existingFeeStructure = await prisma.feeStructure.findUnique({
      where: { id },
    });

    if (!existingFeeStructure) {
      return NextResponse.json(
        { error: "Fee structure not found" },
        { status: 404 }
      );
    }

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

    const updatedFeeStructure = await prisma.feeStructure.update({
      where: { id },
      data: {
        name,
        levelId: levelId || null,
        amount: parseFloat(amount),
        frequency: frequency || "Monthly",
        academicYear,
        description,
        isActive: isActive !== undefined ? isActive : true,
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

    return NextResponse.json({ data: updatedFeeStructure });
  } catch (error) {
    console.error("Error updating fee structure:", error);
    return NextResponse.json(
      { error: "Failed to update fee structure" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete fee structure (deactivate)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if fee structure exists
    const existingFeeStructure = await prisma.feeStructure.findUnique({
      where: { id },
    });

    if (!existingFeeStructure) {
      return NextResponse.json(
        { error: "Fee structure not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.feeStructure.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: "Fee structure deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting fee structure:", error);
    return NextResponse.json(
      { error: "Failed to delete fee structure" },
      { status: 500 }
    );
  }
}