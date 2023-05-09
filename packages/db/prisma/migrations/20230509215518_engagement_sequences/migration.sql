-- CreateTable
CREATE TABLE "engagement_sequences" (
    "id" UUID NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL,
    "name" TEXT,
    "tags" TEXT[],
    "num_steps" INTEGER NOT NULL,
    "scheduled_count" INTEGER NOT NULL,
    "opted_out_count" INTEGER NOT NULL,
    "replied_count" INTEGER NOT NULL,
    "clicked_count" INTEGER NOT NULL,
    "raw_data" JSONB,
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "remote_deleted_at" TIMESTAMP(3),
    "detected_or_remote_deleted_at" TIMESTAMP(3),
    "last_modified_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "_remote_owner_id" TEXT,
    "owner_id" TEXT,

    CONSTRAINT "engagement_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "engagement_sequences_connection_id_last_modified_at_idx" ON "engagement_sequences"("connection_id", "last_modified_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "engagement_sequences_connection_id_remote_id_key" ON "engagement_sequences"("connection_id", "remote_id");
