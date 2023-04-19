-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "destinations_application_id_key" ON "destinations"("application_id");

-- AddForeignKey
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
