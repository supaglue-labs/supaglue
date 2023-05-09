-- CreateTable
CREATE TABLE "engagement_users" (
    "id" UUID NOT NULL,
    "remote_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN,
    "raw_data" JSONB,
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "remote_was_deleted" BOOLEAN NOT NULL DEFAULT false,
    "remote_deleted_at" TIMESTAMP(3),
    "detected_or_remote_deleted_at" TIMESTAMP(3),
    "last_modified_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagement_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "engagement_users_connection_id_last_modified_at_idx" ON "engagement_users"("connection_id", "last_modified_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "engagement_users_connection_id_remote_id_key" ON "engagement_users"("connection_id", "remote_id");
