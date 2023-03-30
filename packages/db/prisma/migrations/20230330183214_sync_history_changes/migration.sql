/*
  Warnings:

  - The primary key for the `sync_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `connection_id` on the `sync_history` table. All the data in the column will be lost.
  - Added the required column `sync_id` to the `sync_history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sync_history" DROP CONSTRAINT "sync_history_connection_id_fkey";

-- AlterTable
ALTER TABLE "sync_history" DROP CONSTRAINT "sync_history_pkey",
DROP COLUMN "connection_id",
ADD COLUMN     "sync_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "sync_history_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "sync_history_id_seq";

-- AddForeignKey
ALTER TABLE "sync_history" ADD CONSTRAINT "sync_history_sync_id_fkey" FOREIGN KEY ("sync_id") REFERENCES "syncs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
