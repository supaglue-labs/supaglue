-- CreateTable
CREATE TABLE "crm_events" (
    "id" TEXT NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "remote_deleted_at" TIMESTAMP(3),
    "detected_or_remote_deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "_remote_account_id" TEXT,
    "account_id" TEXT,
    "_remote_contact_id" TEXT,
    "contact_id" TEXT,
    "_remote_lead_id" TEXT,
    "lead_id" TEXT,
    "_remote_opportunity_id" TEXT,
    "opportunity_id" TEXT,
    "_remote_owner_id" TEXT,
    "owner_id" TEXT,

    CONSTRAINT "crm_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crm_events_connection_id_remote_id_key" ON "crm_events"("connection_id", "remote_id");

-- AddForeignKey
ALTER TABLE "crm_events" ADD CONSTRAINT "crm_events_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "crm_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_events" ADD CONSTRAINT "crm_events_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_events" ADD CONSTRAINT "crm_events_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_events" ADD CONSTRAINT "crm_events_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "crm_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_events" ADD CONSTRAINT "crm_events_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "crm_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
