/*
  Warnings:

  - The primary key for the `object_sync_runs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `cuid` on table `object_sync_runs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "object_sync_runs" DROP CONSTRAINT "object_sync_runs_pkey",
ALTER COLUMN "cuid" SET NOT NULL,
ADD CONSTRAINT "object_sync_runs_pkey" PRIMARY KEY ("cuid");
