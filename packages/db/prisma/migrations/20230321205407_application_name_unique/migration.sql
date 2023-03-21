/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `applications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "applications_name_key" ON "applications"("name");
