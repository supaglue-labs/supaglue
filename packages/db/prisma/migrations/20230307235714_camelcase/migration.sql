/*
  Warnings:

  - You are about to drop the column `firstName` on the `crm_leads` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `crm_leads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "crm_leads" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "first_name" VARCHAR(255),
ADD COLUMN     "last_name" VARCHAR(255);
