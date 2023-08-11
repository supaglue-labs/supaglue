/*
  Warnings:

  - You are about to drop the column `config` on the `destinations` table. All the data in the column will be lost.
  - Made the column `encrypted_config` on table `destinations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "destinations" DROP COLUMN "config",
ALTER COLUMN "encrypted_config" SET NOT NULL;
