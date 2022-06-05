/*
  Warnings:

  - Made the column `description` on table `shortcuts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "shortcuts" ALTER COLUMN "description" SET NOT NULL;
