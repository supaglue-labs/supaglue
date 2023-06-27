-- CreateTable
CREATE TABLE "object_syncs" (
    "id" TEXT NOT NULL,
    "common_object" TEXT,
    "standard_object" TEXT,
    "custom_object" TEXT,
    "state" JSONB NOT NULL,
    "force_sync_flag" BOOLEAN NOT NULL DEFAULT false,
    "strategy" JSONB NOT NULL,
    "connection_id" TEXT NOT NULL,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "sync_config_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "object_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "object_sync_changes" (
    "id" TEXT NOT NULL,
    "object_sync_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "object_sync_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "object_sync_runs" (
    "id" TEXT NOT NULL,
    "object_sync_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "start_timestamp" TIMESTAMP(3) NOT NULL,
    "end_timestamp" TIMESTAMP(3),
    "num_records_synced" INTEGER,

    CONSTRAINT "object_sync_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "object_syncs_connection_id_key" ON "object_syncs"("connection_id");

-- AddForeignKey
ALTER TABLE "object_syncs" ADD CONSTRAINT "object_syncs_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_syncs" ADD CONSTRAINT "object_syncs_sync_config_id_fkey" FOREIGN KEY ("sync_config_id") REFERENCES "sync_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_sync_runs" ADD CONSTRAINT "object_sync_runs_object_sync_id_fkey" FOREIGN KEY ("object_sync_id") REFERENCES "object_syncs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
