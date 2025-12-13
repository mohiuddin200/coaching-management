/*
  Warnings:

  - You are about to drop the column `classId` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the `classes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_classId_fkey";

-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_classId_fkey";

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "classId";

-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "classId";

-- DropTable
DROP TABLE "classes";
