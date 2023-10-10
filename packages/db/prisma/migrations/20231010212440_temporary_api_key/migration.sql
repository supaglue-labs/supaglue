-- CreateTable
CREATE TABLE "temporary_api_keys" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "hashed_api_key" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temporary_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "temporary_api_keys_hashed_api_key_key" ON "temporary_api_keys"("hashed_api_key");

-- AddForeignKey
ALTER TABLE "temporary_api_keys" ADD CONSTRAINT "temporary_api_keys_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
