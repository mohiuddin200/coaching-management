import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log("=== DATABASE CONNECTION TEST ===");
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`;
    console.log("✓ Database connection successful:", result);
    
    // Test if students table exists and check columns
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      ORDER BY ordinal_position
    `;
    
    console.log("Students table columns:");
    (tableInfo as Array<{ column_name: string; data_type: string }>).forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Test simple student count
    const studentCount = await prisma.student.count();
    console.log(`✓ Total students: ${studentCount}`);
    
    // Test if isDeleted column exists
    try {
      const deletedCount = await prisma.student.count({
        where: { isDeleted: false }
      });
      console.log(`✓ Active students (isDeleted: false): ${deletedCount}`);
    } catch (error) {
      console.error("✗ Error querying isDeleted field:", error);
    }
    
    return NextResponse.json({
      success: true,
      connection: true,
      studentCount,
      tableColumns: (tableInfo as Array<{ column_name: string; data_type: string }>).length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}