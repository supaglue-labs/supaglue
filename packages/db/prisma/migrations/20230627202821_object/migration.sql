/*
  Warnings:

  - You are about to drop the column `common_object` on the `object_syncs` table. All the data in the column will be lost.
  - You are about to drop the column `custom_object` on the `object_syncs` table. All the data in the column will be lost.
  - You are about to drop the column `standard_object` on the `object_syncs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[connection_id,object]` on the table `object_syncs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `object` to the `object_syncs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `object_type` to the `object_syncs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "object_syncs" DROP COLUMN "common_object",
DROP COLUMN "custom_object",
DROP COLUMN "standard_object",
ADD COLUMN     "object" TEXT NOT NULL,
ADD COLUMN     "object_type" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "object_syncs_connection_id_object_key" ON "object_syncs"("connection_id", "object");
