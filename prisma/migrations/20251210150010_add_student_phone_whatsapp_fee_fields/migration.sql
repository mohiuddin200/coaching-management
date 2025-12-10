/*
  Warnings:

  - Made the column `dateOfBirth` on table `students` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "students" ADD COLUMN     "monthlyFee" DOUBLE PRECISION,
ADD COLUMN     "studentPhoneNumber" TEXT,
ADD COLUMN     "whatsappNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "dateOfBirth" SET NOT NULL;

-- AlterTable
ALTER TABLE "teacher_payments" ADD COLUMN     "delete_reason" "DeleteReason",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deleted_by" TEXT,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "teacher_payments_is_deleted_idx" ON "teacher_payments"("is_deleted");

-- CreateIndex
CREATE INDEX "teacher_payments_deleted_at_idx" ON "teacher_payments"("deleted_at");
