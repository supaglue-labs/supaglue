/*
  Warnings:

  - You are about to drop the column `integration_id` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the `integration_changes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "connections_customer_id_integration_id_key";

-- AlterTable
ALTER TABLE "connections" DROP COLUMN "integration_id";

-- DropTable
DROP TABLE "integration_changes";
