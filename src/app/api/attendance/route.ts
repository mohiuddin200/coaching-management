import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const attendanceSchema = z.object({
  studentId: z.string(),
  classSectionId: z.string(),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date string",
  }),
  status: z.enum(["Present", "Absent"]),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classSectionId = searchParams.get("classSectionId")
    const date = searchParams.get("date")

    if (!classSectionId || !date) {
      return NextResponse.json(
        { error: "classSectionId and date are required" },
        { status: 400 }
      )
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        classSectionId,
        date: new Date(date),
      },
    })

    return NextResponse.json(attendanceRecords)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, classSectionId, date, status } =
      attendanceSchema.parse(body)

    const attendanceDate = new Date(date)

    // Use upsert to either create a new attendance record or update an existing one
    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_classSectionId_date: {
          studentId,
          classSectionId,
          date: attendanceDate,
        },
      },
      update: {
        status,
      },
      create: {
        studentId,
        classSectionId,
        date: attendanceDate,
        status,
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error saving attendance:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}