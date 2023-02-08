/*
  Warnings:

  - Added the required column `type` to the `syncs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "syncs" ADD COLUMN     "type" TEXT NOT NULL;
