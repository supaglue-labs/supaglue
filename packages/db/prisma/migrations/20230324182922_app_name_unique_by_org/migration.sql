/*
  Warnings:

  - A unique constraint covering the columns `[org_id,name]` on the table `applications` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "applications_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "applications_org_id_name_key" ON "applications"("org_id", "name");
