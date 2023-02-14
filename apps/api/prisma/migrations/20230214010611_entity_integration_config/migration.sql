-- CreateTable
CREATE TABLE "entity_integration_configs" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "integration_type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entity_integration_configs_customer_id_entity_name_integrat_key" ON "entity_integration_configs"("customer_id", "entity_name", "integration_type");
