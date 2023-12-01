-- DropForeignKey
ALTER TABLE "sync_configs" DROP CONSTRAINT "sync_configs_destination_id_fkey";

-- DropForeignKey
ALTER TABLE "sync_configs" DROP CONSTRAINT "sync_configs_provider_id_fkey";

-- AddForeignKey
ALTER TABLE "sync_configs" ADD CONSTRAINT "sync_configs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_configs" ADD CONSTRAINT "sync_configs_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
