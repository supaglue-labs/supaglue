-- CreateTable
CREATE TABLE "schemas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schemas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schemas_application_id_name_key" ON "schemas"("application_id", "name");

-- AddForeignKey
ALTER TABLE "schemas" ADD CONSTRAINT "schemas_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
