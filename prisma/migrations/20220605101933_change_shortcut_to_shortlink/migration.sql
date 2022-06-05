/*
  Warnings:

  - You are about to drop the column `shortcut` on the `shortcuts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shortlink,userId]` on the table `shortcuts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shortlink` to the `shortcuts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "shortcuts_shortcut_userId_key";

-- AlterTable
ALTER TABLE "shortcuts" DROP COLUMN "shortcut",
ADD COLUMN     "shortlink" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "shortcuts_shortlink_userId_key" ON "shortcuts"("shortlink", "userId");
