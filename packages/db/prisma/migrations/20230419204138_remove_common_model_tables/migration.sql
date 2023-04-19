/*
  Warnings:

  - You are about to drop the `crm_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_contacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_leads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_opportunities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "crm_accounts" DROP CONSTRAINT "crm_accounts_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_contacts" DROP CONSTRAINT "crm_contacts_account_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_contacts" DROP CONSTRAINT "crm_contacts_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_events" DROP CONSTRAINT "crm_events_account_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_events" DROP CONSTRAINT "crm_events_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_events" DROP CONSTRAINT "crm_events_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_events" DROP CONSTRAINT "crm_events_opportunity_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_events" DROP CONSTRAINT "crm_events_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_leads" DROP CONSTRAINT "crm_leads_converted_account_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_leads" DROP CONSTRAINT "crm_leads_converted_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_leads" DROP CONSTRAINT "crm_leads_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_opportunities" DROP CONSTRAINT "crm_opportunities_account_id_fkey";

-- DropForeignKey
ALTER TABLE "crm_opportunities" DROP CONSTRAINT "crm_opportunities_owner_id_fkey";

-- DropTable
DROP TABLE "crm_accounts";

-- DropTable
DROP TABLE "crm_contacts";

-- DropTable
DROP TABLE "crm_events";

-- DropTable
DROP TABLE "crm_leads";

-- DropTable
DROP TABLE "crm_opportunities";

-- DropTable
DROP TABLE "crm_users";
