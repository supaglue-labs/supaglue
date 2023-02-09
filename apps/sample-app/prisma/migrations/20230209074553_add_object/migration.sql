-- CreateTable
CREATE TABLE "salesforce_objects" (
    "id" SERIAL NOT NULL,
    "customer_id" VARCHAR(255) NOT NULL,
    "salesforce_id" VARCHAR(255),
    "object" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salesforce_objects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salesforce_objects_customer_id_salesforce_id_key" ON "salesforce_objects"("customer_id", "salesforce_id");
