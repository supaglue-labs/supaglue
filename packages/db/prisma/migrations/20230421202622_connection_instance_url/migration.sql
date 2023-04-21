/*
  Warnings:

  - You are about to drop the column `remote_id` on the `connections` table. All the data in the column will be lost.
  - Added the required column `instance_url` to the `connections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "connections" DROP COLUMN "remote_id",
ADD COLUMN     "instance_url" TEXT NOT NULL;
