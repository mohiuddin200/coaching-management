-- AlterEnum
-- Note: In PostgreSQL, you can only add one value at a time to an enum
ALTER TYPE "DeleteReason" ADD VALUE 'DUPLICATE';
ALTER TYPE "DeleteReason" ADD VALUE 'REFUND';
ALTER TYPE "DeleteReason" ADD VALUE 'CANCELLED';
ALTER TYPE "DeleteReason" ADD VALUE 'WRONG_ENTRY';

-- AlterTable
ALTER TABLE "student_payments"
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deleted_at" TIMESTAMP(3),
ADD COLUMN "deleted_by" TEXT,
ADD COLUMN "delete_reason" "DeleteReason";

-- CreateIndex
CREATE INDEX "student_payments_is_deleted_idx" ON "student_payments"("is_deleted");

-- CreateIndex
CREATE INDEX "student_payments_deleted_at_idx" ON "student_payments"("deleted_at");