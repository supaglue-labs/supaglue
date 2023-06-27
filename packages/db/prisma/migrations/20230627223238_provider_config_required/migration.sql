/*
  Warnings:

  - Made the column `config` on table `providers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "providers" ALTER COLUMN "config" SET NOT NULL;
