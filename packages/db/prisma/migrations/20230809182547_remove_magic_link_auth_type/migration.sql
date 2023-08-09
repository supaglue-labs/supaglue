/*
  Warnings:

  - You are about to drop the column `auth_type` on the `magic_links` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "magic_links" DROP COLUMN "auth_type";
