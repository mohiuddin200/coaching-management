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

    const exam = await prisma.exam.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        subject: true,
        level: true,
        teacher: true,
        results: {
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
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { id } = await params;
    const body = await request.json();

    const {
      name,
      type,
      description,
      subjectId,
      levelId,
      teacherId,
      totalMarks,
      passingMarks,
      examDate,
      duration,
      questionPaperUrl,
      answerKeyUrl,
      startTime,
      endTime,
      roomNumber,
      academicYear,
      status,
    } = body;

    // Check if exam exists
    const existingExam = await prisma.exam.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existingExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Verify subject belongs to level if they're being updated
    if (subjectId && levelId) {
      const subject = await prisma.subject.findFirst({
        where: {
          id: subjectId,
          levelId: levelId,
        },
      });

      if (!subject) {
        return NextResponse.json(
          { error: "Subject does not belong to the selected level" },
          { status: 400 }
        );
      }
    }

    // Update exam
    const exam = await prisma.exam.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(subjectId && { subjectId }),
        ...(levelId && { levelId }),
        ...(teacherId && { teacherId }),
        ...(totalMarks && { totalMarks: parseFloat(totalMarks) }),
        ...(passingMarks !== undefined && {
          passingMarks: passingMarks ? parseFloat(passingMarks) : null,
        }),
        ...(examDate && { examDate: new Date(examDate) }),
        ...(duration !== undefined && {
          duration: duration ? parseInt(duration) : null,
        }),
        ...(questionPaperUrl !== undefined && { questionPaperUrl }),
        ...(answerKeyUrl !== undefined && { answerKeyUrl }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(roomNumber !== undefined && { roomNumber }),
        ...(academicYear && { academicYear }),
        ...(status && { status }),
      },
      include: {
        subject: true,
        level: true,
        teacher: true,
      },
    });

    // Create notification if status changed to Completed
    if (status === "Completed" && existingExam.status !== "Completed") {
      await prisma.notification.create({
        data: {
          type: "ResultPublished",
          title: "Exam Results Published",
          message: `Results for ${exam.name} have been published`,
          examId: exam.id,
        },
      });
    }

    return NextResponse.json({
      exam,
      message: "Exam updated successfully",
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if exam exists
    const exam = await prisma.exam.findFirst({
      where: { id, isDeleted: false },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Soft delete
    await prisma.exam.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.id,
        deleteReason: "CANCELLED",
      },
    });

    return NextResponse.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
