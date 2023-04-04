/*
  Warnings:

  - Made the column `remote_id` on table `connections` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "connections" ALTER COLUMN "remote_id" SET NOT NULL;
