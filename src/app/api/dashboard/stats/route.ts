import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requirePageAccess } from "@/lib/permissions/server";

export async function GET() {
  try {
    // Require dashboard page access
    const userContext = await requirePageAccess("/dashboard");

    // Get counts filtered by organization
    const [
      totalStudents,
      totalTeachers,
      totalClassSections,
      activeEnrollments,
    ] = await Promise.all([
      prisma.student.count({
        where: { 
          status: "Active",
          organizationId: userContext.organizationId
        },
      }),
      prisma.teacher.count({
        where: { 
          status: "Active",
          organizationId: userContext.organizationId
        },
      }),
      prisma.classSection.count({
        where: { 
          status: "Scheduled",
          organizationId: userContext.organizationId
        },
      }),
      prisma.enrollment.count({
        where: { 
          status: "Active",
          student: {
            organizationId: userContext.organizationId
          }
        },
      }),
    ]);

    // Get recent students filtered by organization
    const recentStudents = await prisma.student.findMany({
      take: 5,
      where: {
        organizationId: userContext.organizationId
      },
      orderBy: { enrollmentDate: "desc" },
      include: {
        level: true,
      },
    });

    // Get class sections with enrollment counts filtered by organization
    const classSections = await prisma.classSection.findMany({
      take: 10,
      where: { 
        status: "Scheduled",
        organizationId: userContext.organizationId
      },
      include: {
        subject: {
          include: {
            level: true,
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

    // Get enrollment by level filtered by organization
    const enrollmentsByLevel = await prisma.level.findMany({
      where: {
        organizationId: userContext.organizationId
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { levelNumber: "asc" },
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
          level: { name: string } | null;
          enrollmentDate: Date;
          status: string;
        }) => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          level: student.level?.name || null,
          enrollmentDate: student.enrollmentDate,
          status: student.status,
        })
      ),
      recentClasses: classSections.map(
        (section: {
          id: string;
          name: string;
          subject: { name: string; level: { name: string } | null };
          teacher: { firstName: string; lastName: string };
          _count: { enrollments: number };
          capacity: number;
          status: string;
        }) => ({
          id: section.id,
          name: section.name,
          subject: section.subject.name,
          teacher: `${section.teacher.firstName} ${section.teacher.lastName}`,
          level: section.subject.level?.name || null,
          enrollmentCount: section._count.enrollments,
          capacity: section.capacity,
          status: section.status,
        })
      ),
      enrollmentByLevel: enrollmentsByLevel.map(
        (level: { name: string; _count: { students: number } }) => ({
          level: level.name,
          students: level._count.students,
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
