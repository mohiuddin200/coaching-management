/*
  Warnings:

  - You are about to drop the column `parentName` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `parentPhone` on the `students` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_Positive', 'A_Negative', 'B_Positive', 'B_Negative', 'AB_Positive', 'AB_Negative', 'O_Positive', 'O_Negative');

-- AlterTable
ALTER TABLE "students" DROP COLUMN "parentName",
DROP COLUMN "parentPhone",
ADD COLUMN     "birthCertificate" TEXT,
ADD COLUMN     "bloodGroup" "BloodGroup",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelation" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "fatherPhone" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "idProof" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "motherPhone" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "previousClass" TEXT,
ADD COLUMN     "previousMarks" DOUBLE PRECISION,
ADD COLUMN     "previousSchool" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "streetAddress" TEXT;
