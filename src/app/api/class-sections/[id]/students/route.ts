import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classSectionId = id;

    if (!classSectionId) {
      return NextResponse.json(
        { error: "Class Section ID is required" },
        { status: 400 }
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        classSectionId: classSectionId,
        status: "Active",
      },
      include: {
        student: {
          include: {
            level: true,
          },
        },
      },
      orderBy: {
        student: {
          firstName: "asc",
        },
      },
    });

    const students = enrollments.map(
      (enrollment: {
        student: {
          id: string;
          firstName: string;
          lastName: string;
          level: { id: string; name: string } | null;
        };
      }) => enrollment.student
    );

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students for class section:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
