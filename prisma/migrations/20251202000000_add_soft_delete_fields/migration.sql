-- Add soft delete fields to teachers table
ALTER TABLE "teachers" 
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deleted_at" TIMESTAMP(3),
ADD COLUMN "deleted_by" TEXT,
ADD COLUMN "delete_reason" TEXT;

-- Add soft delete fields to students table
ALTER TABLE "students" 
ADD COLUMN "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deleted_at" TIMESTAMP(3),
ADD COLUMN "deleted_by" TEXT,
ADD COLUMN "delete_reason" TEXT;

-- Create indexes for better performance on soft deleted queries
CREATE INDEX "teachers_is_deleted_idx" ON "teachers"("is_deleted");
CREATE INDEX "teachers_deleted_at_idx" ON "teachers"("deleted_at");
CREATE INDEX "students_is_deleted_idx" ON "students"("is_deleted");
CREATE INDEX "students_deleted_at_idx" ON "students"("deleted_at");

-- Create a check constraint for delete_reason to ensure valid values
ALTER TABLE "teachers" 
ADD CONSTRAINT "teachers_delete_reason_check" 
CHECK ("delete_reason" IN ('RESIGNED', 'TERMINATED', 'REASSIGNED', 'ERROR', 'OTHER') OR "delete_reason" IS NULL);

ALTER TABLE "students" 
ADD CONSTRAINT "students_delete_reason_check" 
CHECK ("delete_reason" IN ('GRADUATED', 'TRANSFERRED', 'ERROR', 'OTHER') OR "delete_reason" IS NULL);