-- CreateIndex
CREATE INDEX "crm_accounts_connection_id_last_modified_at_idx" ON "crm_accounts"("connection_id", "last_modified_at" ASC);

-- CreateIndex
CREATE INDEX "crm_contacts_connection_id_last_modified_at_idx" ON "crm_contacts"("connection_id", "last_modified_at" ASC);

-- CreateIndex
CREATE INDEX "crm_events_connection_id_last_modified_at_idx" ON "crm_events"("connection_id", "last_modified_at" ASC);

-- CreateIndex
CREATE INDEX "crm_leads_connection_id_last_modified_at_idx" ON "crm_leads"("connection_id", "last_modified_at" ASC);

-- CreateIndex
CREATE INDEX "crm_opportunities_connection_id_last_modified_at_idx" ON "crm_opportunities"("connection_id", "last_modified_at" ASC);

-- CreateIndex
CREATE INDEX "crm_users_connection_id_last_modified_at_idx" ON "crm_users"("connection_id", "last_modified_at" ASC);
