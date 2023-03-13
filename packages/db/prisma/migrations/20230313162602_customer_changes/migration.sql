/*
  Warnings:

  - A unique constraint covering the columns `[application_id,external_identifier]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_identifier` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "external_identifier" TEXT NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(320);

-- CreateIndex
CREATE UNIQUE INDEX "customers_application_id_external_identifier_key" ON "customers"("application_id", "external_identifier");
