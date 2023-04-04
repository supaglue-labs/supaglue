-- CreateTable
CREATE TABLE "sync_changes" (
    "id" TEXT NOT NULL,
    "sync_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_changes_pkey" PRIMARY KEY ("id")
);
