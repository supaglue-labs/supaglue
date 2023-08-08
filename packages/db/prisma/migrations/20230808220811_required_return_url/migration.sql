/*
  Warnings:

  - Made the column `return_url` on table `magic_links` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "magic_links" ALTER COLUMN "return_url" SET NOT NULL;
