import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get counts
    const [
      totalStudents,
      totalTeachers,
      totalClassSections,
      activeEnrollments,
    ] = await Promise.all([
      prisma.student.count({
        where: { status: "Active" },
      }),
      prisma.teacher.count({
        where: { status: "Active" },
      }),
      prisma.classSection.count({
        where: { status: "Scheduled" },
      }),
      prisma.enrollment.count({
        where: { status: "Active" },
      }),
    ]);

    // Get recent students
    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { enrollmentDate: "desc" },
      include: {
        class: true,
      },
    });

    // Get session sections with enrollment counts
    const classSections = await prisma.classSection.findMany({
      take: 10,
      where: { status: "Scheduled" },
      include: {
        subject: {
          include: {
            class: true,
          },
        },
        teacher: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get enrollment by class
    const enrollmentsByLevel = await prisma.class.findMany({
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { classNumber: "asc" },
    });

    // Calculate today's attendance (placeholder - will be dynamic)
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const todayAttendance = await prisma.attendance.findMany({
    //   where: {
    //     timestamp: {
    //       gte: today,
    //     },
    //   },
    // });

    const stats = {
      overview: {
        totalStudents,
        totalTeachers,
        totalClasses: totalClassSections,
        attendanceToday: 87, // Placeholder
        activeEnrollments,
        monthlyRevenue: 125000, // Placeholder
      },
      recentStudents: recentStudents.map(
        (student: {
          id: string;
          firstName: string;
          lastName: string;
          class: { name: string } | null;
          enrollmentDate: Date;
          status: string;
        }) => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          class: student.class?.name || null,
          enrollmentDate: student.enrollmentDate,
          status: student.status,
        })
      ),
      recentClasses: classSections.map(
        (section: {
          id: string;
          name: string;
          subject: { name: string; class: { name: string } | null };
          teacher: { firstName: string; lastName: string };
          _count: { enrollments: number };
          capacity: number;
          status: string;
        }) => ({
          id: section.id,
          name: section.name,
          subject: section.subject.name,
          teacher: `${section.teacher.firstName} ${section.teacher.lastName}`,
          class: section.subject.class?.name || null,
          enrollmentCount: section._count.enrollments,
          capacity: section.capacity,
          status: section.status,
        })
      ),
      enrollmentByLevel: enrollmentsByLevel.map(
        (classData: { name: string; _count: { students: number } }) => ({
          class: classData.name,
          students: classData._count.students,
        })
      ),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
