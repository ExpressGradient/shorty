/*
  Warnings:

  - You are about to drop the column `shortlink` on the `shortcuts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shortLink,userId]` on the table `shortcuts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shortLink` to the `shortcuts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "shortcuts_shortlink_userId_key";

-- AlterTable
ALTER TABLE "shortcuts" DROP COLUMN "shortlink",
ADD COLUMN     "shortLink" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "shortcuts_shortLink_userId_key" ON "shortcuts"("shortLink", "userId");
