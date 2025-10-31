-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- DropForeignKey
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."enrollments" DROP CONSTRAINT "enrollments_classId_fkey";

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "classSectionId" TEXT,
ALTER COLUMN "classId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "classSectionId" TEXT,
ALTER COLUMN "classId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "levelId" TEXT;

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "levelId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "roomNumber" TEXT,
    "academicYear" TEXT NOT NULL,
    "status" "ClassStatus" NOT NULL DEFAULT 'Scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "classSectionId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "levels_name_key" ON "levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "levels_levelNumber_key" ON "levels"("levelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_levelId_name_key" ON "subjects"("levelId", "name");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sections" ADD CONSTRAINT "class_sections_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_classSectionId_fkey" FOREIGN KEY ("classSectionId") REFERENCES "class_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_classSectionId_fkey" FOREIGN KEY ("classSectionId") REFERENCES "class_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_classSectionId_fkey" FOREIGN KEY ("classSectionId") REFERENCES "class_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
