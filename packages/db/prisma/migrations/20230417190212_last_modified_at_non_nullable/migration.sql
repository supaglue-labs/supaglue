/*
  Warnings:

  - Made the column `last_modified_at` on table `crm_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_modified_at` on table `crm_contacts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_modified_at` on table `crm_events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_modified_at` on table `crm_leads` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_modified_at` on table `crm_opportunities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_modified_at` on table `crm_users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "crm_accounts" ALTER COLUMN "last_modified_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "crm_contacts" ALTER COLUMN "last_modified_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "crm_events" ALTER COLUMN "last_modified_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "crm_leads" ALTER COLUMN "last_modified_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "crm_opportunities" ALTER COLUMN "last_modified_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "crm_users" ALTER COLUMN "last_modified_at" SET NOT NULL;
