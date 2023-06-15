/*
  Warnings:

  - A unique constraint covering the columns `[customer_id,provider_id]` on the table `connections` will be added. If there are existing duplicate values, this will fail.
  - Made the column `provider_id` on table `connections` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "connections" DROP CONSTRAINT "connections_integration_id_fkey";

-- DropForeignKey
ALTER TABLE "connections" DROP CONSTRAINT "connections_provider_id_fkey";

-- AlterTable
ALTER TABLE "connections" ALTER COLUMN "provider_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "sync_config_changes" (
    "id" TEXT NOT NULL,
    "sync_config_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_config_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "connections_customer_id_provider_id_key" ON "connections"("customer_id", "provider_id");

-- AddForeignKey
ALTER TABLE "sync_configs" ADD CONSTRAINT "sync_configs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_configs" ADD CONSTRAINT "sync_configs_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
