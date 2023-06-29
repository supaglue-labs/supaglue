/*
  Warnings:

  - You are about to drop the column `force_sync_flag` on the `object_syncs` table. All the data in the column will be lost.
  - You are about to drop the `sync_changes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sync_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `syncs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sync_history" DROP CONSTRAINT "sync_history_sync_id_fkey";

-- DropForeignKey
ALTER TABLE "syncs" DROP CONSTRAINT "syncs_connection_id_fkey";

-- DropForeignKey
ALTER TABLE "syncs" DROP CONSTRAINT "syncs_sync_config_id_fkey";

-- AlterTable
ALTER TABLE "object_syncs" DROP COLUMN "force_sync_flag";

-- DropTable
DROP TABLE "sync_changes";

-- DropTable
DROP TABLE "sync_history";

-- DropTable
DROP TABLE "syncs";
