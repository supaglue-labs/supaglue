-- CreateTable
CREATE TABLE "sync_history" (
    "id" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "error_message" TEXT,
    "start_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_timestamp" TIMESTAMP(3),
    "connection_id" TEXT NOT NULL,

    CONSTRAINT "sync_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sync_history" ADD CONSTRAINT "sync_history_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
