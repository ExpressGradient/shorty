/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `shortcuts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tags` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shortcuts" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "updatedAt";
