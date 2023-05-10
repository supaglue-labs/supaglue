-- CreateTable
CREATE TABLE "engagement_sequence_states" (
    "id" UUID NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "state" TEXT,
    "raw_data" JSONB,
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "remote_deleted_at" TIMESTAMP(3),
    "detected_or_remote_deleted_at" TIMESTAMP(3),
    "last_modified_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "_remote_mailbox_id" TEXT,
    "mailbox_id" TEXT,
    "_remote_sequence_id" TEXT,
    "sequence_id" TEXT,
    "_remote_contact_id" TEXT,
    "contact_id" TEXT,

    CONSTRAINT "engagement_sequence_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "engagement_sequence_states_connection_id_last_modified_at_idx" ON "engagement_sequence_states"("connection_id", "last_modified_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "engagement_sequence_states_connection_id_remote_id_key" ON "engagement_sequence_states"("connection_id", "remote_id");
