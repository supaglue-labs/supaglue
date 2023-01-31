-- CreateTable
CREATE TABLE "sync_runs" (
    "id" TEXT NOT NULL,
    "sync_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_sync_id_fkey" FOREIGN KEY ("sync_id") REFERENCES "syncs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
