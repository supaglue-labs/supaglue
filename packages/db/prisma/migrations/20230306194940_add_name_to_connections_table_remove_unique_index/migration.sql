-- DropIndex
DROP INDEX "connections_customer_id_integration_id_key";

-- AlterTable
ALTER TABLE "connections" ADD COLUMN     "name" TEXT;
