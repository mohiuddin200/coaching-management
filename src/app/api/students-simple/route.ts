import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log("=== SIMPLE STUDENTS API ===");
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ Database connection successful");
    
    // Get total count first
    const totalCount = await prisma.student.count();
    console.log(`✓ Total students: ${totalCount}`);
    
    // Try to get students with minimal query
    const students = await prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        status: true,
        enrollmentDate: true,
        levelId: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✓ Fetched ${students.length} students with minimal query`);
    
    return NextResponse.json({ 
      students,
      debug: {
        totalCount,
        fetchedCount: students.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("Error in simple students API:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch students", 
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}