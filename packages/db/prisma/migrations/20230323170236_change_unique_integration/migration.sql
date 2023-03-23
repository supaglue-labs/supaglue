/*
  Warnings:

  - A unique constraint covering the columns `[application_id,provider_name]` on the table `integrations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "integrations_provider_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "integrations_application_id_provider_name_key" ON "integrations"("application_id", "provider_name");
