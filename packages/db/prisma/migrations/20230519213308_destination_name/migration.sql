/*
  Warnings:

  - A unique constraint covering the columns `[application_id,name]` on the table `destinations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `destinations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "destinations" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "destinations_application_id_name_key" ON "destinations"("application_id", "name");
