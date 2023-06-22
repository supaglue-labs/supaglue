/*
  Warnings:

  - Made the column `sync_config_id` on table `syncs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "syncs" DROP CONSTRAINT "syncs_sync_config_id_fkey";

-- AlterTable
ALTER TABLE "syncs" ALTER COLUMN "sync_config_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "syncs" ADD CONSTRAINT "syncs_sync_config_id_fkey" FOREIGN KEY ("sync_config_id") REFERENCES "sync_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
