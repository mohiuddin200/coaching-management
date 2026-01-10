import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requirePageAccess } from "@/lib/permissions/server";

const attendanceSchema = z.object({
  studentId: z.string(),
  classSectionId: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date string",
  }),
  status: z.enum(["Present", "Absent"]),
});

export async function GET(request: NextRequest) {
  try {
    // Require attendance page access
    const userContext = await requirePageAccess("/attendance");

    const { searchParams } = new URL(request.url);
    const classSectionId = searchParams.get("classSectionId");
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    const whereClause = {
      date: new Date(date),
      ...(classSectionId && { classSectionId }),
      student: {
        organizationId: userContext.organizationId, // Filter by organization through student
      },
    };

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
    });

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Require attendance page access
    const userContext = await requirePageAccess("/attendance");

    const body = await request.json();
    const { studentId, classSectionId, date, status } =
      attendanceSchema.parse(body);

    // Verify student belongs to organization
    const student = await prisma.student.findFirst({
      where: { 
        id: studentId,
        organizationId: userContext.organizationId
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const attendanceDate = new Date(date);

    // Use upsert to either create a new attendance record or update an existing one
    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: attendanceDate,
        },
      },
      update: {
        status,
        ...(classSectionId && { classSectionId }),
      },
      create: {
        studentId,
        classSectionId,
        date: attendanceDate,
        status,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error saving attendance:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
