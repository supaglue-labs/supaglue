-- DropForeignKey
ALTER TABLE "connections" DROP CONSTRAINT "connections_customer_id_fkey";

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
