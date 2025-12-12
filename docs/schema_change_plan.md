 Prisma Schema Refactoring Plan

 Student-Class-ClassSection Architecture Update

 Overview

 Refactor the Prisma schema to implement direct Student enrollment in Classes (Grades) with
 Teacher-created ClassSections for specific subjects.

 Current Issues Identified

 1. Student model has classId but should enroll directly in Class (Grade)
 2. Session model is redundant and conflicts with ClassSection
 3. ClassSection missing direct relationship to Class
 4. Attendance and Enrollment models have conflicting optional fields
 5. Table mapping inconsistency: Class model maps to "levels" table

 Detailed Schema Changes.

 1. Fix Class Model Mapping

 File: /home/mohiuddin/code/coaching-management/prisma/schema.prisma
 Lines: 118-131

 Current:
 model Class {
   id            String         @id @default(cuid())
   name          String         @unique
   levelNumber   Int            @unique
   description   String?
   status        Status         @default(Active)
   createdAt     DateTime       @default(now())
   updatedAt     DateTime       @updatedAt
   students      Student[]
   subjects      Subject[]
   feeStructures FeeStructure[]

   @@map("levels")  // WRONG - should be "classes"
 }

 New:
 model Class {
   id            String         @id @default(cuid())
   name          String         @unique  // "Grade 10", "Grade 11"
   levelNumber   Int            @unique  // 10, 11, 12
   description   String?
   status        Status         @default(Active)
   createdAt     DateTime       @default(now())
   updatedAt     DateTime       @updatedAt
   students      Student[]      // Direct enrollment
   subjects      Subject[]      // Subjects offered in this grade
   classSections ClassSection[] // Sections for this grade
   feeStructures FeeStructure[]

   @@map("classes")  // FIXED - proper table name
 }

 2. Update Student Model - Remove Class Reference

 Lines: 67-116

 Remove these fields:
 classId      String   // REMOVE THIS
 class        Class    @relation(fields: [classId], references: [id])  // REMOVE THIS

 Add new field:
 classId      String   // KEEP - direct grade enrollment
 class        Class    @relation(fields: [classId], references: [id])  // KEEP - updated relation

 3. Remove Session Model Entirely

 Lines: 183-197

 Delete entire model:
 model Session {
   // DELETE ALL OF THIS
 }

 4. Update ClassSection Model

 Lines: 149-167

 Current:
 model ClassSection {
   id           String       @id @default(cuid())
   name         String
   subjectId    String       // CHANGE to classId
   teacherId    String
   capacity     Int          @default(30)
   roomNumber   String?
   academicYear String
   status       ClassStatus  @default(Scheduled)
   createdAt    DateTime     @default(now())
   updatedAt    DateTime     @updatedAt
   attendances  Attendance[]
   subject      Subject      @relation(fields: [subjectId], references: [id], onDelete: Cascade)  //
 REMOVE
   teacher      Teacher      @relation("TeacherToClassSection", fields: [teacherId], references: [id])
   enrollments  Enrollment[]
   schedules    Schedule[]

   @@map("class_sections")
 }

 New:
 model ClassSection {
   id           String       @id @default(cuid())
   name         String       // "Math - Section A", "Physics - Lab Section"
   classId      String       // NEW - which grade this belongs to
   subjectId    String       // KEEP - which subject
   teacherId    String
   capacity     Int          @default(30)
   roomNumber   String?
   academicYear String
   status       ClassStatus  @default(Scheduled)
   createdAt    DateTime     @default(now())
   updatedAt    DateTime     @updatedAt
   attendances  Attendance[]
   class        Class        @relation(fields: [classId], references: [id])  // NEW
   subject      Subject      @relation(fields: [subjectId], references: [id], onDelete: Cascade)
   teacher      Teacher      @relation("TeacherToClassSection", fields: [teacherId], references: [id])
   enrollments  Enrollment[]
   schedules    Schedule[]

   @@map("class_sections")
 }

 5. Update Enrollment Model

 Lines: 199-213

 Remove session references:
 sessionId      String?      // REMOVE
 session        Session?     @relation(fields: [sessionId], references: [id])  // REMOVE

 Make classSection required:
 classSectionId String        // REMOVE ? - make required
 classSection   ClassSection  @relation(fields: [classSectionId], references: [id], onDelete: Cascade)
 // REMOVE ?

 6. Update Attendance Model

 Lines: 215-232

 Remove session references:
 sessionId      String?      // REMOVE
 session        Session?     @relation(fields: [sessionId], references: [id])  // REMOVE

 Update unique constraint:
 @@unique([studentId, date, classSectionId])  // ADD classSectionId for uniqueness

 7. Update Teacher Model

 Lines: 21-65

 Remove sessions relation:
 sessions       Session[]    // REMOVE

 8. Update Subject Model

 Lines: 133-147

 No changes needed - current structure is correct with classId reference.

 Migration Strategy

 Phase 1: Database Migration

 1. Backup current database
 2. Create new migration with npx prisma migrate dev --name refactor-student-class-architecture
 3. Handle data migration:
   - Existing Student.classId values remain valid
   - Existing ClassSection records need classId populated
   - Session records need to be migrated to ClassSection or archived

 Phase 2: Code Updates

 1. Update API routes that reference Session model
 2. Update frontend components that use session endpoints
 3. Update forms to reflect new Student-Class enrollment flow
 4. Update attendance tracking to use ClassSection only

 Files to Modify

 Schema Files

 - prisma/schema.prisma - Main schema changes

 API Routes (Likely needs updates)

 - src/app/api/class-sections/[id]/route.ts
 - src/app/api/students/[id]/route.ts
 - src/app/api/attendance/route.ts
 - Remove any session-related API routes

 Frontend Components (Likely needs updates)

 - src/app/sessions/page.tsx - Rename to class-sections
 - src/components/students/ - Update enrollment forms
 - src/app/attendance/page.tsx - Update attendance UI
 - src/app/classes/page.tsx - Update class management

 Risk Assessment

 - High: Removing Session model affects attendance and enrollment
 - Medium: ClassSection changes affect scheduling and teacher assignments
 - Low: Student-Class relationship is mostly preserving existing pattern

 Rollback Plan

 1. Keep migration files for potential rollback
 2. Backup database before applying migration
 3. Test in development environment first

 Testing Required

 1. Student enrollment flow works correctly
 2. Teacher can create ClassSections for their assigned Class
 3. Attendance tracking functions with only ClassSection
 4. All existing Student-Class relationships preserved
 5. No orphaned records after migration

 ---Approval Required: Please review and approve this plan before implementation.
