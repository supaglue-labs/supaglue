-- AlterTable
ALTER TABLE "connections" ADD COLUMN     "providerId" TEXT;

-- AlterTable
ALTER TABLE "syncs" ADD COLUMN     "sync_config_id" TEXT;

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "auth_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_configs" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "providers_application_id_name_key" ON "providers"("application_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "sync_configs_provider_id_key" ON "sync_configs"("provider_id");

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syncs" ADD CONSTRAINT "syncs_sync_config_id_fkey" FOREIGN KEY ("sync_config_id") REFERENCES "sync_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
