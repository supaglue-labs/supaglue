-- CreateTable
CREATE TABLE "entity_syncs" (
    "id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "strategy" JSONB NOT NULL,
    "connection_id" TEXT NOT NULL,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "sync_config_id" TEXT NOT NULL,
    "args_for_next_run" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_sync_changes" (
    "id" TEXT NOT NULL,
    "entity_sync_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_sync_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_sync_runs" (
    "id" TEXT NOT NULL,
    "entity_sync_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "start_timestamp" TIMESTAMP(3) NOT NULL,
    "end_timestamp" TIMESTAMP(3),
    "num_records_synced" INTEGER,

    CONSTRAINT "entity_sync_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entity_syncs_connection_id_entity_id_key" ON "entity_syncs"("connection_id", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "entities_application_id_name_key" ON "entities"("application_id", "name");

-- AddForeignKey
ALTER TABLE "entity_syncs" ADD CONSTRAINT "entity_syncs_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_syncs" ADD CONSTRAINT "entity_syncs_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_syncs" ADD CONSTRAINT "entity_syncs_sync_config_id_fkey" FOREIGN KEY ("sync_config_id") REFERENCES "sync_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_sync_runs" ADD CONSTRAINT "entity_sync_runs_entity_sync_id_fkey" FOREIGN KEY ("entity_sync_id") REFERENCES "entity_syncs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
