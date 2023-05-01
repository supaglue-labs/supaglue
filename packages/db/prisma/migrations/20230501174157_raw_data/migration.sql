/*
  Warnings:

  - You are about to drop the column `remote_data` on the `crm_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `remote_data` on the `crm_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `remote_data` on the `crm_leads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "crm_accounts" DROP COLUMN "remote_data",
ADD COLUMN     "raw_data" JSONB;

-- AlterTable
ALTER TABLE "crm_contacts" DROP COLUMN "remote_data",
ADD COLUMN     "raw_data" JSONB;

-- AlterTable
ALTER TABLE "crm_events" ADD COLUMN     "raw_data" JSONB;

-- AlterTable
ALTER TABLE "crm_leads" DROP COLUMN "remote_data",
ADD COLUMN     "raw_data" JSONB;

-- AlterTable
ALTER TABLE "crm_opportunities" ADD COLUMN     "raw_data" JSONB;

-- AlterTable
ALTER TABLE "crm_users" ADD COLUMN     "raw_data" JSONB;
