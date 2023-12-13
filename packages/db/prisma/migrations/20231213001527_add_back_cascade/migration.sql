-- DropForeignKey
ALTER TABLE "connections" DROP CONSTRAINT "connections_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "connections" DROP CONSTRAINT "connections_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "object_syncs" DROP CONSTRAINT "object_syncs_connection_id_fkey";

-- DropForeignKey
ALTER TABLE "object_syncs" DROP CONSTRAINT "object_syncs_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "object_syncs" DROP CONSTRAINT "object_syncs_sync_config_id_fkey";

-- DropForeignKey
ALTER TABLE "replay_ids" DROP CONSTRAINT "replay_ids_connection_id_fkey";

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_syncs" ADD CONSTRAINT "object_syncs_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_syncs" ADD CONSTRAINT "object_syncs_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_syncs" ADD CONSTRAINT "object_syncs_sync_config_id_fkey" FOREIGN KEY ("sync_config_id") REFERENCES "sync_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "replay_ids" ADD CONSTRAINT "replay_ids_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
