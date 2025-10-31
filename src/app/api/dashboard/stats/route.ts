import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
        where: { status: 'Active' },
      }),
      prisma.teacher.count({
        where: { status: 'Active' },
      }),
      prisma.classSection.count({
        where: { status: 'Scheduled' },
      }),
      prisma.enrollment.count({
        where: { status: 'Active' },
      }),
    ]);

    // Get recent students
    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { enrollmentDate: 'desc' },
      include: {
        level: true,
      },
    });

    // Get class sections with enrollment counts
    const classSections = await prisma.classSection.findMany({
      take: 10,
      where: { status: 'Scheduled' },
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
      orderBy: { createdAt: 'desc' },
    });

    // Get enrollment by level
    const enrollmentsByLevel = await prisma.level.findMany({
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { levelNumber: 'asc' },
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
      recentStudents: recentStudents.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        level: student.level?.name || null,
        enrollmentDate: student.enrollmentDate,
        status: student.status,
      })),
      recentClasses: classSections.map((section) => ({
        id: section.id,
        name: section.name,
        subject: section.subject.name,
        teacher: `${section.teacher.firstName} ${section.teacher.lastName}`,
        level: section.subject.level.name,
        enrollmentCount: section._count.enrollments,
        capacity: section.capacity,
        status: section.status,
      })),
      enrollmentByLevel: enrollmentsByLevel.map((level) => ({
        level: level.name,
        students: level._count.students,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
