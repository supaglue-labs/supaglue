/*
  Warnings:

  - You are about to drop the column `timestamp` on the `sync_runs` table. All the data in the column will be lost.
  - Added the required column `start_timestamp` to the `sync_runs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sync_runs" DROP COLUMN "timestamp",
ADD COLUMN     "finish_timestamp" TIMESTAMP(3),
ADD COLUMN     "start_timestamp" TIMESTAMP(3) NOT NULL;
