/*
  Warnings:

  - A unique constraint covering the columns `[customer_id,sync_config_name]` on the table `syncs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "syncs_customer_id_sync_config_name_key" ON "syncs"("customer_id", "sync_config_name");
