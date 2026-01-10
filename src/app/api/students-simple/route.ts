import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePageAccess } from '@/lib/permissions/server';

export async function GET() {
  try {
    // Require authentication and check page access
    const userContext = await requirePageAccess('/students');
    
    console.log("=== SIMPLE STUDENTS API ===");
    console.log(`User: ${userContext.email}, Org: ${userContext.organizationId}`);
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ Database connection successful");
    
    // Get total count for this organization
    const totalCount = await prisma.student.count({
      where: { organizationId: userContext.organizationId }
    });
    console.log(`✓ Total students in organization: ${totalCount}`);
    
    // Get students filtered by organization
    const students = await prisma.student.findMany({
      where: {
        organizationId: userContext.organizationId
      },
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
    
    console.log(`✓ Fetched ${students.length} students with organization filter`);
    
    return NextResponse.json({ 
      students,
      debug: {
        totalCount,
        fetchedCount: students.length,
        organizationId: userContext.organizationId,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    // Handle permission errors
    if (error instanceof Error && (error.message.includes("Forbidden") || error.message.includes("Unauthorized"))) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Forbidden") ? 403 : 401 }
      );
    }
    
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