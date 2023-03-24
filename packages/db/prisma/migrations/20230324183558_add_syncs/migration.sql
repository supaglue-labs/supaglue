-- CreateTable
CREATE TABLE "syncs" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "connection_id" TEXT NOT NULL,

    CONSTRAINT "syncs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "syncs_connection_id_model_key" ON "syncs"("connection_id", "model");

-- AddForeignKey
ALTER TABLE "syncs" ADD CONSTRAINT "syncs_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
