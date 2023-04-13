/*
  Warnings:

  - A unique constraint covering the columns `[last_modified_at,id]` on the table `crm_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[last_modified_at,id]` on the table `crm_contacts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[last_modified_at,id]` on the table `crm_events` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[last_modified_at,id]` on the table `crm_leads` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[last_modified_at,id]` on the table `crm_opportunities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[last_modified_at,id]` on the table `crm_users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "crm_accounts_last_modified_at_id_key" ON "crm_accounts"("last_modified_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_contacts_last_modified_at_id_key" ON "crm_contacts"("last_modified_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_events_last_modified_at_id_key" ON "crm_events"("last_modified_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_leads_last_modified_at_id_key" ON "crm_leads"("last_modified_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_opportunities_last_modified_at_id_key" ON "crm_opportunities"("last_modified_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "crm_users_last_modified_at_id_key" ON "crm_users"("last_modified_at", "id");
