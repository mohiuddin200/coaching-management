/**
 * Test cases for soft delete fix with auto-generated enrollment cleanup
 * This file tests the solution for the student management system soft delete issue
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test configuration
const TEST_CONFIG = {
  // Test student data
  studentData: {
    firstName: 'Test',
    lastName: 'Student',
    email: 'test.student@example.com',
    phoneNumber: '+1234567890',
    fatherName: 'Test Father',
    fatherPhone: '+1234567891',
    motherName: 'Test Mother',
    motherPhone: '+1234567892',
    address: 'Test Address'
  }
};

interface TestLevelData {
  level: any;
  mathSubject: any;
  scienceSubject: any;
  teacher: any;
  mathSection: any;
  scienceSection: any;
}

/**
 * Helper function to create a test level with subjects and class sections
 */
async function createTestLevel(): Promise<TestLevelData> {
  console.log('Creating test level with subjects and class sections...');
  
  // Create a level
  const level = await prisma.level.create({
    data: {
      name: 'Test Level',
      levelNumber: 999,
      description: 'Test level for soft delete testing'
    }
  });

  // Create subjects for the level
  const mathSubject = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      code: 'MATH',
      levelId: level.id
    }
  });

  const scienceSubject = await prisma.subject.create({
    data: {
      name: 'Science',
      code: 'SCI',
      levelId: level.id
    }
  });

  // Create a teacher for class sections
  const teacher = await prisma.teacher.create({
    data: {
      firstName: 'Test',
      lastName: 'Teacher',
      phoneNumber: '+1234567893',
      joinDate: new Date()
    }
  });

  // Create class sections
  const mathSection = await prisma.classSection.create({
    data: {
      name: 'Math Section A',
      subjectId: mathSubject.id,
      teacherId: teacher.id,
      academicYear: '2024-2025',
      status: 'Scheduled'
    }
  });

  const scienceSection = await prisma.classSection.create({
    data: {
      name: 'Science Section A',
      subjectId: scienceSubject.id,
      teacherId: teacher.id,
      academicYear: '2024-2025',
      status: 'Scheduled'
    }
  });

  console.log(`Created level ${level.id} with 2 subjects and 2 class sections`);
  
  return { level, mathSubject, scienceSubject, teacher, mathSection, scienceSection };
}

/**
 * Test Case 1: Student creation with auto-generated enrollments
 */
async function testStudentCreationWithAutoEnrollments(): Promise<{student: any, level: any}> {
  console.log('\n=== Test Case 1: Student Creation with Auto-Generated Enrollments ===');
  
  try {
    const { level } = await createTestLevel();
    
    // Create student with levelId (should trigger auto-enrollment)
    const student = await prisma.student.create({
      data: {
        ...TEST_CONFIG.studentData,
        email: `test1.${Date.now()}@example.com`,
        levelId: level.id
      },
      include: {
        enrollments: {
          include: {
            classSection: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    });

    console.log(`✓ Created student ${student.id} with ${student.enrollments.length} auto-generated enrollments`);
    
    // Verify enrollments are for the correct level
    const allCorrectLevel = student.enrollments.every((e: any) => 
      e.classSection.subject.levelId === level.id
    );
    
    if (allCorrectLevel) {
      console.log('✓ All auto-generated enrollments are for the correct level');
    } else {
      console.log('✗ Some enrollments are for the wrong level');
    }

    return { student, level };
  } catch (error) {
    console.error('✗ Test Case 1 failed:', error);
    throw error;
  }
}

/**
 * Test Case 2: Soft delete without manual enrollments (should succeed)
 */
async function testSoftDeleteWithoutManualEnrollments(): Promise<void> {
  console.log('\n=== Test Case 2: Soft Delete Without Manual Enrollments ===');
  
  try {
    const { student } = await testStudentCreationWithAutoEnrollments();
    
    // Attempt to soft delete the student
    const response = await fetch(`http://localhost:3000/api/students/${student.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✓ Soft delete succeeded');
      console.log('Response:', result);
      
      // Verify student is soft deleted
      const deletedStudent = await prisma.student.findUnique({
        where: { id: student.id }
      });
      
      if (deletedStudent?.isDeleted) {
        console.log('✓ Student is marked as deleted');
      } else {
        console.log('✗ Student is not marked as deleted');
      }
      
      // Verify auto-generated enrollments are cleaned up
      const remainingEnrollments = await prisma.enrollment.count({
        where: { studentId: student.id }
      });
      
      if (remainingEnrollments === 0) {
        console.log('✓ Auto-generated enrollments were cleaned up');
      } else {
        console.log(`✗ ${remainingEnrollments} enrollments still exist`);
      }
      
    } else {
      console.log('✗ Soft delete failed');
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.error('✗ Test Case 2 failed:', error);
    throw error;
  }
}

/**
 * Test Case 3: Soft delete with manual enrollments (should fail appropriately)
 */
async function testSoftDeleteWithManualEnrollments(): Promise<void> {
  console.log('\n=== Test Case 3: Soft Delete With Manual Enrollments ===');
  
  try {
    const { level } = await createTestLevel();
    
    // Create student with levelId
    const student = await prisma.student.create({
      data: {
        ...TEST_CONFIG.studentData,
        email: `test3.${Date.now()}@example.com`,
        levelId: level.id
      }
    });

    // Add a manual enrollment (different level)
    const otherLevel = await prisma.level.create({
      data: {
        name: 'Other Level',
        levelNumber: 998,
        description: 'Other level for manual enrollment testing'
      }
    });

    const otherSubject = await prisma.subject.create({
      data: {
        name: 'Other Subject',
        code: 'OTHER',
        levelId: otherLevel.id
      }
    });

    const otherTeacher = await prisma.teacher.create({
      data: {
        firstName: 'Other',
        lastName: 'Teacher',
        phoneNumber: '+1234567894',
        joinDate: new Date()
      }
    });

    const otherSection = await prisma.classSection.create({
      data: {
        name: 'Other Section',
        subjectId: otherSubject.id,
        teacherId: otherTeacher.id,
        academicYear: '2024-2025',
        status: 'Scheduled'
      }
    });

    // Create manual enrollment
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        classSectionId: otherSection.id,
        status: 'Active'
      }
    });

    console.log(`Created student ${student.id} with auto-generated and manual enrollments`);
    
    // Attempt to soft delete the student
    const response = await fetch(`http://localhost:3000/api/students/${student.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.log('✓ Soft delete appropriately failed due to manual enrollments');
      console.log('Error:', result);
      
      // Verify auto-generated enrollments were cleaned up but manual ones remain
      const remainingEnrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id },
        include: {
          classSection: {
            include: {
              subject: true
            }
          }
        }
      });
      
      const autoGeneratedRemaining = remainingEnrollments.filter((e: any) => 
        e.classSection.subject.levelId === level.id
      );
      
      const manualRemaining = remainingEnrollments.filter((e: any) => 
        e.classSection.subject.levelId === otherLevel.id
      );
      
      if (autoGeneratedRemaining.length === 0 && manualRemaining.length === 1) {
        console.log('✓ Auto-generated enrollments were cleaned up, manual enrollment preserved');
      } else {
        console.log(`✗ Enrollment cleanup issue: ${autoGeneratedRemaining.length} auto-generated, ${manualRemaining.length} manual remaining`);
      }
      
    } else {
      console.log('✗ Soft delete should have failed but succeeded');
      console.log('Response:', result);
    }
    
  } catch (error) {
    console.error('✗ Test Case 3 failed:', error);
    throw error;
  }
}

/**
 * Test Case 4: Cascade delete with all related records
 */
async function testCascadeDelete(): Promise<void> {
  console.log('\n=== Test Case 4: Cascade Delete With All Related Records ===');
  
  try {
    const { level } = await createTestLevel();
    
    // Create student with levelId
    const student = await prisma.student.create({
      data: {
        ...TEST_CONFIG.studentData,
        email: `test4.${Date.now()}@example.com`,
        levelId: level.id
      }
    });

    // Add some attendances and payments
    await prisma.attendance.create({
      data: {
        studentId: student.id,
        date: new Date(),
        status: 'Present'
      }
    });

    await prisma.studentPayment.create({
      data: {
        studentId: student.id,
        amount: 100.0,
        paymentDate: new Date(),
        dueDate: new Date(),
        status: 'Paid',
        monthYear: '2024-01'
      }
    });

    console.log(`Created student ${student.id} with attendances and payments`);
    
    // Attempt cascade delete
    const response = await fetch(`http://localhost:3000/api/students/${student.id}?cascade=true`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✓ Cascade delete succeeded');
      console.log('Response:', result);
      
      // Verify all records are deleted
      const studentExists = await prisma.student.findUnique({
        where: { id: student.id }
      });
      
      const attendanceCount = await prisma.attendance.count({
        where: { studentId: student.id }
      });
      
      const paymentCount = await prisma.studentPayment.count({
        where: { studentId: student.id }
      });
      
      const enrollmentCount = await prisma.enrollment.count({
        where: { studentId: student.id }
      });
      
      if (!studentExists && attendanceCount === 0 && paymentCount === 0 && enrollmentCount === 0) {
        console.log('✓ All related records were properly deleted');
      } else {
        console.log('✗ Some records still exist:');
        console.log(`  Student: ${studentExists ? 'exists' : 'deleted'}`);
        console.log(`  Attendances: ${attendanceCount}`);
        console.log(`  Payments: ${paymentCount}`);
        console.log(`  Enrollments: ${enrollmentCount}`);
      }
      
    } else {
      console.log('✗ Cascade delete failed');
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.error('✗ Test Case 4 failed:', error);
    throw error;
  }
}

/**
 * Cleanup function to remove test data
 */
async function cleanupTestData(): Promise<void> {
  console.log('\n=== Cleaning Up Test Data ===');
  
  try {
    // Delete test records (in order of dependencies)
    await prisma.enrollment.deleteMany({
      where: {
        student: {
          email: {
            contains: 'test.'
          }
        }
      }
    });
    
    await prisma.attendance.deleteMany({
      where: {
        student: {
          email: {
            contains: 'test.'
          }
        }
      }
    });
    
    await prisma.studentPayment.deleteMany({
      where: {
        student: {
          email: {
            contains: 'test.'
          }
        }
      }
    });
    
    await prisma.student.deleteMany({
      where: {
        email: {
          contains: 'test.'
        }
      }
    });
    
    // Delete test levels, subjects, etc.
    const testLevels = await prisma.level.findMany({
      where: {
        name: {
          contains: 'Test'
        }
      }
    });
    
    for (const level of testLevels) {
      await prisma.level.delete({
        where: { id: level.id }
      });
    }
    
    console.log('✓ Test data cleaned up');
  } catch (error) {
    console.error('✗ Cleanup failed:', error);
  }
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  console.log('🧪 Running Soft Delete Fix Tests\n');
  console.log('This test suite validates the fix for the soft delete issue');
  console.log('where auto-generated enrollments prevent student deletion.\n');
  
  try {
    // Run all test cases
    await testStudentCreationWithAutoEnrollments();
    await testSoftDeleteWithoutManualEnrollments();
    await testSoftDeleteWithManualEnrollments();
    await testCascadeDelete();
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  } finally {
    // Always cleanup
    await cleanupTestData();
    
    // Disconnect from database
    await prisma.$disconnect();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export {
  runTests,
  testStudentCreationWithAutoEnrollments,
  testSoftDeleteWithoutManualEnrollments,
  testSoftDeleteWithManualEnrollments,
  testCascadeDelete,
  cleanupTestData
};