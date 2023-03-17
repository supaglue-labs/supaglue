/*
  Warnings:

  - Added the required column `email` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "name" VARCHAR(255) NOT NULL;
