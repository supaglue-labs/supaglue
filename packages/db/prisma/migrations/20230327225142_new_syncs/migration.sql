/*
  Warnings:

  - You are about to drop the column `data` on the `syncs` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `syncs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[connection_id]` on the table `syncs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `state` to the `syncs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strategy` to the `syncs` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "syncs_connection_id_model_key";

-- AlterTable
ALTER TABLE "syncs" DROP COLUMN "data",
DROP COLUMN "model",
ADD COLUMN     "state" JSONB NOT NULL,
ADD COLUMN     "strategy" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "syncs_connection_id_key" ON "syncs"("connection_id");
