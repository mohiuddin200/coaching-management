import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: examId, studentId } = await params;
    const body = await request.json();
    const { marksObtained, grade, remarks, attended, absentReason } = body;

    // Verify exam exists
    const exam = await prisma.exam.findFirst({
      where: { id: examId, isDeleted: false },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Verify student exists
    const student = await prisma.student.findFirst({
      where: { id: studentId, isDeleted: false },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Upsert result
    const result = await prisma.examResult.upsert({
      where: {
        examId_studentId: {
          examId,
          studentId,
        },
      },
      update: {
        marksObtained: marksObtained ? parseFloat(marksObtained) : null,
        grade,
        remarks,
        attended: attended ?? false,
        absentReason,
        gradedBy: user.id,
        gradedAt: new Date(),
      },
      create: {
        examId,
        studentId,
        marksObtained: marksObtained ? parseFloat(marksObtained) : null,
        grade,
        remarks,
        attended: attended ?? false,
        absentReason,
        gradedBy: user.id,
        gradedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      result,
      message: "Result saved successfully",
    });
  } catch (error) {
    console.error("Error saving exam result:", error);
    return NextResponse.json(
      { error: "Failed to save exam result" },
      { status: 500 }
    );
  }
}
