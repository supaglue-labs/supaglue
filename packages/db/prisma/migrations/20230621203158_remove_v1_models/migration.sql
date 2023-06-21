/*
  Warnings:

  - You are about to drop the `crm_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_contacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_leads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_opportunities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `crm_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `engagement_contacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `engagement_mailboxes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `engagement_sequence_states` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `engagement_sequences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `engagement_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `integrations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "integrations" DROP CONSTRAINT "integrations_application_id_fkey";

-- DropForeignKey
ALTER TABLE "integrations" DROP CONSTRAINT "integrations_destination_id_fkey";

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

-- DropTable
DROP TABLE "engagement_contacts";

-- DropTable
DROP TABLE "engagement_mailboxes";

-- DropTable
DROP TABLE "engagement_sequence_states";

-- DropTable
DROP TABLE "engagement_sequences";

-- DropTable
DROP TABLE "engagement_users";

-- DropTable
DROP TABLE "integrations";
