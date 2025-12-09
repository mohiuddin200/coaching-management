/*
  Warnings:

  - The `delete_reason` column on the `students` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `delete_reason` column on the `teachers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DeleteReason" AS ENUM ('RESIGNED', 'TERMINATED', 'REASSIGNED', 'GRADUATED', 'TRANSFERRED', 'ERROR', 'OTHER');

-- DropIndex
DROP INDEX "students_deleted_at_idx";

-- DropIndex
DROP INDEX "students_is_deleted_idx";

-- DropIndex
DROP INDEX "teachers_deleted_at_idx";

-- DropIndex
DROP INDEX "teachers_is_deleted_idx";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "delete_reason",
ADD COLUMN     "delete_reason" "DeleteReason";

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "delete_reason",
ADD COLUMN     "delete_reason" "DeleteReason";
