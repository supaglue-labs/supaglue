/*
  Warnings:

  - Changed the type of `credentials` on the `connections` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "connections" DROP COLUMN "credentials",
ADD COLUMN     "credentials" BYTEA NOT NULL;
