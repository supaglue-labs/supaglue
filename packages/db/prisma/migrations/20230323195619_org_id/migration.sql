/*
  Warnings:

  - You are about to drop the `sg_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "org_id" TEXT;

-- DropTable
DROP TABLE "sg_users";
