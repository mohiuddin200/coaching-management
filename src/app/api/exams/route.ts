import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ExamStatus, ExamType } from "@/generated/enums";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get("levelId");
    const subjectId = searchParams.get("subjectId");
    const teacherId = searchParams.get("teacherId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const exams = await prisma.exam.findMany({
      where: {
        isDeleted: false,
        ...(levelId && { levelId }),
        ...(subjectId && { subjectId }),
        ...(teacherId && { teacherId }),
        ...(status && { status: status as ExamStatus }),
        ...(type && { type: type as ExamType }),
        ...(fromDate && {
          examDate: {
            gte: new Date(fromDate),
          },
        }),
        ...(toDate && {
          examDate: {
            lte: new Date(toDate),
          },
        }),
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        level: {
          select: {
            id: true,
            name: true,
            levelNumber: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        results: {
          select: {
            id: true,
            marksObtained: true,
            attended: true,
          },
        },
      },
      orderBy: {
        examDate: "desc",
      },
    });

    return NextResponse.json({ data: exams });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    } = body;

    // Validation
    if (
      !name ||
      !subjectId ||
      !levelId ||
      !teacherId ||
      !totalMarks ||
      !examDate ||
      !academicYear
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, subjectId, levelId, teacherId, totalMarks, examDate, academicYear",
        },
        { status: 400 }
      );
    }

    // Verify subject belongs to level
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

    // Create exam
    const exam = await prisma.exam.create({
      data: {
        name,
        type: type || "Monthly",
        description,
        subjectId,
        levelId,
        teacherId,
        totalMarks: parseFloat(totalMarks),
        passingMarks: passingMarks ? parseFloat(passingMarks) : null,
        examDate: new Date(examDate),
        duration: duration ? parseInt(duration) : null,
        questionPaperUrl,
        answerKeyUrl,
        startTime,
        endTime,
        roomNumber,
        academicYear,
        createdBy: user.id,
        status: "Scheduled",
      },
      include: {
        subject: true,
        level: true,
        teacher: true,
      },
    });

    // Create notification for exam creation
    await prisma.notification.create({
      data: {
        type: "ExamScheduled",
        title: "New Exam Scheduled",
        message: `${exam.name} has been scheduled for ${exam.subject.name} - ${exam.level.name}`,
        examId: exam.id,
      },
    });

    return NextResponse.json({
      exam,
      message: "Exam created successfully",
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}
