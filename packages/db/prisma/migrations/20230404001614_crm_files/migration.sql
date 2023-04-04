-- CreateTable
CREATE TABLE "crm_files" (
    "id" TEXT NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "archived" TEXT NOT NULL,
    "archived_at" TIMESTAMP(3),
    "parent_folder_id" TEXT,
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "remote_deleted_at" TIMESTAMP(3),
    "detected_or_remote_deleted_at" TIMESTAMP(3),
    "name" TEXT,
    "path" TEXT,
    "size" INTEGER,
    "type" TEXT,
    "extension" TEXT,
    "url" TEXT,
    "height" INTEGER,
    "width" INTEGER,
    "encoding" TEXT,
    "default_hosting_url" TEXT,
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
    "_remote_event_id" TEXT,
    "event_id" TEXT,

    CONSTRAINT "crm_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crm_files_connection_id_remote_id_key" ON "crm_files"("connection_id", "remote_id");

-- AddForeignKey
ALTER TABLE "crm_files" ADD CONSTRAINT "crm_files_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "crm_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_files" ADD CONSTRAINT "crm_files_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "crm_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_files" ADD CONSTRAINT "crm_files_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_files" ADD CONSTRAINT "crm_files_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "crm_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_files" ADD CONSTRAINT "crm_files_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "crm_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_files" ADD CONSTRAINT "crm_files_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "crm_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
