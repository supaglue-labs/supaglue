-- CreateTable
CREATE TABLE "replay_ids" (
    "connection_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "replay_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "replay_ids_connection_id_event_type_key" ON "replay_ids"("connection_id", "event_type");

-- AddForeignKey
ALTER TABLE "replay_ids" ADD CONSTRAINT "replay_ids_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
