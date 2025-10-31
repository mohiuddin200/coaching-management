import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Get attendance statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    interface WhereClause {
      studentId?: string;
      timestamp?: { gte: Date; lte: Date };
    }

    const where: WhereClause = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get total attendance count
    const totalCount = await prisma.attendance.count({ where });

    // Get attendance by entry type
    const entryCount = await prisma.attendance.count({
      where: { ...where, entryType: 'Entry' },
    });

    const exitCount = await prisma.attendance.count({
      where: { ...where, entryType: 'Exit' },
    });

    // Get daily attendance if date range is specified
    let dailyStats = null;
    if (startDate && endDate) {
      const attendances = await prisma.attendance.findMany({
        where,
        select: {
          timestamp: true,
        },
      });

      // Group by date
      const dailyMap = new Map<string, number>();
      attendances.forEach(att => {
        const date = att.timestamp.toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });

      dailyStats = Array.from(dailyMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));
    }

    return NextResponse.json({
      stats: {
        total: totalCount,
        entries: entryCount,
        exits: exitCount,
        daily: dailyStats,
      },
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance statistics' },
      { status: 500 }
    );
  }
}
