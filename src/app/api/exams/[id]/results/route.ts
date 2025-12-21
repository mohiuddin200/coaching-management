import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const results = await prisma.examResult.findMany({
      where: {
        examId: id,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        student: {
          firstName: "asc",
        },
      },
    });

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam results" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: examId } = await params;
    const body = await request.json();
    const { results } = body;

    if (!results || !Array.isArray(results)) {
      return NextResponse.json(
        { error: "Results array is required" },
        { status: 400 }
      );
    }

    // Verify exam exists
    const exam = await prisma.exam.findFirst({
      where: { id: examId, isDeleted: false },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Bulk upsert results
    const upsertPromises = results.map((result: {
      studentId: string;
      marksObtained?: number | null;
      grade?: string | null;
      remarks?: string | null;
      attended?: boolean;
      absentReason?: string | null;
    }) => {
      const {
        studentId,
        marksObtained,
        grade,
        remarks,
        attended,
        absentReason,
      } = result;

      return prisma.examResult.upsert({
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
      });
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({
      message: "Results saved successfully",
    });
  } catch (error) {
    console.error("Error saving exam results:", error);
    return NextResponse.json(
      { error: "Failed to save exam results" },
      { status: 500 }
    );
  }
}
