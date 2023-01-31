-- CreateTable
CREATE TABLE "syncs" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "sync_config_name" TEXT NOT NULL,
    "field_mapping" JSONB NOT NULL,

    CONSTRAINT "syncs_pkey" PRIMARY KEY ("id")
);
