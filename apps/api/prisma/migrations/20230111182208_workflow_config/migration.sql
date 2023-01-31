/*
  Warnings:

  - Added the required column `module` to the `workflows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleConfig` to the `workflows` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "module" TEXT NOT NULL,
ADD COLUMN     "moduleConfig" JSONB NOT NULL;
