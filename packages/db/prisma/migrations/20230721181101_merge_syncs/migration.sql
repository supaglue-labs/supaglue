/*
  Warnings:

  - You are about to drop the `entity_sync_changes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `entity_sync_runs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `entity_syncs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[connection_id,type,object_type,object]` on the table `object_syncs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[connection_id,type,entity_id]` on the table `object_syncs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "entity_sync_runs" DROP CONSTRAINT "entity_sync_runs_entity_sync_id_fkey";

-- DropForeignKey
ALTER TABLE "entity_syncs" DROP CONSTRAINT "entity_syncs_connection_id_fkey";

-- DropForeignKey
ALTER TABLE "entity_syncs" DROP CONSTRAINT "entity_syncs_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "entity_syncs" DROP CONSTRAINT "entity_syncs_sync_config_id_fkey";

-- DropIndex
DROP INDEX "object_syncs_connection_id_object_type_object_key";

-- AlterTable
ALTER TABLE "object_syncs" ADD COLUMN     "entity_id" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'object',
ALTER COLUMN "object" DROP NOT NULL,
ALTER COLUMN "object_type" DROP NOT NULL;

-- DropTable
DROP TABLE "entity_sync_changes";

-- DropTable
DROP TABLE "entity_sync_runs";

-- DropTable
DROP TABLE "entity_syncs";

-- CreateIndex
CREATE UNIQUE INDEX "object_syncs_connection_id_type_object_type_object_key" ON "object_syncs"("connection_id", "type", "object_type", "object");

-- CreateIndex
CREATE UNIQUE INDEX "object_syncs_connection_id_type_entity_id_key" ON "object_syncs"("connection_id", "type", "entity_id");

-- AddForeignKey
ALTER TABLE "object_syncs" ADD CONSTRAINT "object_syncs_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
