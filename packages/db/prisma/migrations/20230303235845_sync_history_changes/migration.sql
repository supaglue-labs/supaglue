/*
  Warnings:

  - The primary key for the `sync_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `result` on the `sync_history` table. All the data in the column will be lost.
  - The `id` column on the `sync_history` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `status` to the `sync_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sync_history" DROP CONSTRAINT "sync_history_pkey",
DROP COLUMN "result",
ADD COLUMN     "status" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "sync_history_pkey" PRIMARY KEY ("id");
