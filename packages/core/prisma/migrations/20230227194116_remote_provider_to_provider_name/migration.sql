/*
  Warnings:

  - You are about to drop the column `remote_provider` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `remote_provider` on the `integrations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider_name]` on the table `integrations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider_name` to the `connections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_name` to the `integrations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "integrations_remote_provider_key";

-- AlterTable
ALTER TABLE "connections" DROP COLUMN "remote_provider",
ADD COLUMN     "provider_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "integrations" DROP COLUMN "remote_provider",
ADD COLUMN     "provider_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "integrations_provider_name_key" ON "integrations"("provider_name");
