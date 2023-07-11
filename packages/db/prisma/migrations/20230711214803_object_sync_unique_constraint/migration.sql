/*
  Warnings:

  - A unique constraint covering the columns `[connection_id,object_type,object]` on the table `object_syncs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "object_syncs_connection_id_object_key";

-- CreateIndex
CREATE UNIQUE INDEX "object_syncs_connection_id_object_type_object_key" ON "object_syncs"("connection_id", "object_type", "object");
