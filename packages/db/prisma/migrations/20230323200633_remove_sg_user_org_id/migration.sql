/*
  Warnings:

  - You are about to drop the `sg_users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `org_id` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "org_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "sg_users";
