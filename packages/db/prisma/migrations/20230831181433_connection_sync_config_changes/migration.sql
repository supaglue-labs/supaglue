-- CreateTable
CREATE TABLE "connection_sync_config_changes" (
    "id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connection_sync_config_changes_pkey" PRIMARY KEY ("id")
);
