/*
  Warnings:

  - You are about to drop the `field_collections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "workflows" DROP CONSTRAINT "workflows_fieldCollectionId_fkey";

-- DropTable
DROP TABLE "field_collections";

-- DropTable
DROP TABLE "workflows";
