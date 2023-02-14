-- CreateTable
CREATE TABLE "field_mappings" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "integration_type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "field_mappings_customer_id_entity_name_integration_type_key" ON "field_mappings"("customer_id", "entity_name", "integration_type");
