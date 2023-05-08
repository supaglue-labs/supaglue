-- CreateTable
CREATE TABLE "engagement_contacts" (
    "id" UUID NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "job_title" TEXT,
    "address" JSONB NOT NULL,
    "email_addresses" JSONB NOT NULL,
    "phone_numbers" JSONB NOT NULL,
    "open_count" INTEGER NOT NULL,
    "click_count" INTEGER NOT NULL,
    "reply_count" INTEGER NOT NULL,
    "bounced_count" INTEGER NOT NULL,
    "raw_data" JSONB,
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "remote_deleted_at" TIMESTAMP(3),
    "detected_or_remote_deleted_at" TIMESTAMP(3),
    "last_modified_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagement_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "engagement_contacts_connection_id_last_modified_at_idx" ON "engagement_contacts"("connection_id", "last_modified_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "engagement_contacts_connection_id_remote_id_key" ON "engagement_contacts"("connection_id", "remote_id");
