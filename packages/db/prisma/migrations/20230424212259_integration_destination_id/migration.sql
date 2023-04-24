-- AlterTable
ALTER TABLE "integrations" ADD COLUMN     "destination_id" TEXT;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
