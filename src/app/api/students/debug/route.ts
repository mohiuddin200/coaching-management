import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log("=== DEBUG: Students API Diagnostic ===");
    
    // Test 1: Basic connection
    console.log("1. Testing database connection...");
    console.log("✓ Database connection OK");
    
    // Test 2: Count all students (no filter)
    console.log("2. Counting all students...");
    const allStudentsCount = await prisma.student.count();
    console.log(`✓ Total students in database: ${allStudentsCount}`);
    
    // Test 3: Count non-deleted students
    console.log("3. Counting non-deleted students...");
    const activeStudentsCount = await prisma.student.count({
      where: { isDeleted: false }
    });
    console.log(`✓ Active students (isDeleted: false): ${activeStudentsCount}`);
    
    // Test 4: Count deleted students
    console.log("4. Counting deleted students...");
    const deletedStudentsCount = await prisma.student.count({
      where: { isDeleted: true }
    });
    console.log(`✓ Deleted students (isDeleted: true): ${deletedStudentsCount}`);
    
    // Test 5: Try to fetch a few active students with minimal fields
    console.log("5. Fetching sample active students...");
    const sampleStudents = await prisma.student.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isDeleted: true,
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✓ Sample students fetched: ${sampleStudents.length}`);
    sampleStudents.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.firstName} ${student.lastName} (isDeleted: ${student.isDeleted})`);
    });
    
    // Test 6: Try the full query (same as main route)
    console.log("6. Testing full query with includes...");
    const fullQueryStudents = await prisma.student.findMany({
      where: { isDeleted: false },
      include: {
        level: true,
        enrollments: {
          where: { status: "Active" },
          include: {
            classSection: {
              include: { subject: true }
            }
          }
        }
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✓ Full query students fetched: ${fullQueryStudents.length}`);
    
    return NextResponse.json({
      success: true,
      diagnostics: {
        databaseConnection: true,
        allStudentsCount,
        activeStudentsCount,
        deletedStudentsCount,
        sampleStudents: sampleStudents.length,
        fullQueryStudents: fullQueryStudents.length,
        sampleData: sampleStudents,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("=== ERROR IN DEBUG ENDPOINT ===");
    console.error("Error:", error);
    
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}