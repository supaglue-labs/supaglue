-- CreateTable
CREATE TABLE "sync_config_changes" (
    "id" TEXT NOT NULL,
    "sync_config_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_config_changes_pkey" PRIMARY KEY ("id")
);
