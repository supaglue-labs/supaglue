-- CreateIndex
CREATE INDEX "object_sync_runs_status_idx" ON "object_sync_runs"("status");

-- CreateIndex
CREATE INDEX "object_syncs_connection_id_idx" ON "object_syncs"("connection_id");
