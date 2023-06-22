/*
  Warnings:

  - You are about to drop the column `raw_object` on the `sync_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sync_history" DROP COLUMN "raw_object",
ADD COLUMN     "custom_object" TEXT,
ADD COLUMN     "standard_object" TEXT;
