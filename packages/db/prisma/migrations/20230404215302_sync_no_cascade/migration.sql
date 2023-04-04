-- DropForeignKey
ALTER TABLE "syncs" DROP CONSTRAINT "syncs_connection_id_fkey";

-- AddForeignKey
ALTER TABLE "syncs" ADD CONSTRAINT "syncs_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
